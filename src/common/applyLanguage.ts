import { IR, typesPass } from "../IR";
import { expandVariants } from "./expandVariants";
import { programToPath, Visitor } from "./traverse";
import { Language, defaultDetokenizer } from "./Language";

export default function applyLanguage(
  language: Language,
  program: IR.Program,
  skipTypesPass: boolean = false
): string {
  validateLanguage(language);
  if (language.name === "Polygolf") {
    if (!skipTypesPass) {
      program = structuredClone(program);
      typesPass(program);
    }
    return applyLanguageToVariants(language, [program]);
  } else {
    const variants = expandVariants(program);
    if (!skipTypesPass)
      for (const variant of variants) {
        typesPass(variant);
      }
    return applyLanguageToVariants(language, variants);
  }
}

export function applyLanguageToVariants(
  language: Language,
  variants: IR.Program[]
): string {
  const detokenizer = language.detokenizer ?? defaultDetokenizer();
  const finalEmit = (ir: IR.Program) =>
    detokenizer(
      language.emitter(
        language.emitPlugins.reduce((a, plugin) => {
          const clone = structuredClone(a);
          programToPath(clone).visit(plugin);
          return clone;
        }, ir)
      )
    );
  return variants
    .map((variant) => golfProgram(variant, language.golfPlugins, finalEmit))
    .reduce((a, b) => (a.length < b.length ? a : b));
}

function golfProgram(
  program: IR.Program,
  golfPlugins: Visitor[],
  finalEmit: (ir: IR.Program) => string
): string {
  // TODO: actually use golfPlugins
  return finalEmit(program);
}

function validateLanguage(language: Language) {
  const bad1 = language.golfPlugins.find((p) => p.generatesVariants !== true);
  if (bad1 !== undefined)
    throw new Error(
      `Expected only generatesVariants golfPlugins in language ${language.name} ` +
        `but found plugin ${bad1.name}`
    );
  const bad2 = language.emitPlugins.find((p) => p.generatesVariants);
  if (bad2 !== undefined)
    throw new Error(
      `Expected no generatesVariants emitPlugins in language ${language.name} ` +
        `but found plugin ${bad2.name}`
    );
}
