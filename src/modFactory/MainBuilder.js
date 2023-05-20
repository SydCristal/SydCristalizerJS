export function buildMain({ nameSpace, className }) {
		let content = `using BlueprintCore.Utils;
using HarmonyLib;
using Kingmaker.Blueprints.JsonSystem;
using System;
using UnityModManagerNet;

namespace ${nameSpace};
public static class ${className} {
		internal static readonly string Key = "${nameSpace}";
		private static readonly LogWrapper Logger = LogWrapper.Get(Key);
		public static bool Load(UnityModManager.ModEntry modEntry) {
				try {
						var harmony = new Harmony(modEntry.Info.Id);
						harmony.PatchAll();
						Logger.Info("Finished patching.");
				} catch (Exception e) {
						Logger.Error("Failed to patch", e);
				} return true;
		}

		[HarmonyPatch(typeof(BlueprintsCache))]
		static class BlueprintsCaches_Postfix {
				private static bool Initialized = false;

				[HarmonyPriority(Priority.First)]
				[HarmonyPatch(nameof(BlueprintsCache.Init)), HarmonyPostfix]
				static void Postfix() {
						try {
								if (Initialized) {
										Logger.Warn("Already configured blueprints.");
										return;
								}

								Initialized = true;

								Logger.Warn("Configuring blueprints.");

								LocalizationTool.LoadEmbeddedLocalizationPacks("${nameSpace}.Localization.json");
								MenuConfigurator.Configure();
						} catch (Exception e) { Logger.Error("Failed to configure blueprints.", e); }
				}
		}
}`
		return content
}