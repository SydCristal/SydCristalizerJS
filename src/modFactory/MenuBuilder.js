import _ from 'lodash'

function toRegistry(obj) {
		return _.transform(obj, (result, { children, menuComponents }) => {
				if (_.isArray(menuComponents)) result.push(...menuComponents)
				if (children) result.push(...toRegistry(children))
		}, [])
}

function writeAddToggle(key) {
		return `
								.AddToggle(Toggle
										.New("${key.toLowerCase()}", defaultValue: false, GetTitle("${key}"))
										.WithLongDescription(GetDescription("${key}"))`
}

export function buildMenu(nameSpace, structure) {
		const registry = toRegistry(structure)
		const toggleKeys = registry
				.filter(({ type }) => type === 'moduleToggle' || type === 'subModuleToggle')
				.map(({ key }) => `"${key}"`)
				.join(', \r\n    ')
		let content = `using BlueprintCore.Utils;
using Kingmaker.Localization;
using ModMenu.Settings;
using System;
using System.Collections.Generic;
using Menu = ModMenu.ModMenu;

namespace ${nameSpace};
internal static class MenuConfigurator {
		internal static readonly string Key = "${nameSpace}.MenuConfigurator";
		private static readonly LogWrapper Logger = LogWrapper.Get(Key);
		private static SettingsBuilder MenuSettings;
		private static List<string> ToggleKeys = new() {\r\n    ${toggleKeys}\r\n  };
		internal static bool IsEnabled(string key) {
				return Menu.GetSettingValue<bool>(key.ToLower());
		}
		private static LocalizedString GetTitle(string key) {
				return LocalizationTool.GetString($"{key}.Title");
		}
		private static LocalizedString GetDescription(string key) {
				return LocalizationTool.GetString($"{key}.Description");
		}
		private static void OnModuleToggle(string key, bool value) {
				foreach (var toggleKey in ToggleKeys) {
						if (!value && toggleKey != key && toggleKey.Contains(key)) {
								Menu.SetSetting(toggleKey.ToLower(), value);
						}
				}
		}
		private static void OnSubModuleToggle(string key, bool value) {
				foreach (var toggleKey in ToggleKeys) {
						if (value && toggleKey != key && key.Contains(toggleKey)) {
								Menu.SetSetting(toggleKey.ToLower(), value);
						}
				}
		}
		internal static void Configure() {
				try {
						Logger.Warn($"Configuring: {Key}");
						MenuSettings = SettingsBuilder
								.New(Key.ToLower(), GetTitle("${nameSpace}"))`

		registry.forEach(({ key, type }) => {
				switch (type) {
						case 'subHeader':
								content += `
						.AddSubHeader(GetTitle("${key}"), startExpanded: false)`
								break
						case 'moduleToggle':
								content += `${writeAddToggle(key)}
								.OnTempValueChanged(value => OnModuleToggle("${key}", value)))`
								break
						case 'subModuleToggle':
								content += `${writeAddToggle(key)}
								.ShowVisualConnection()
								.OnTempValueChanged(value => OnSubModuleToggle("${key}", value)))`
								break
						default: break
				}
		})

		content += `;

						Menu.AddSettings(MenuSettings);
				} catch (Exception e) { Logger.Error($"Failed to configure: ", e); }
		}
}`
		return content
}