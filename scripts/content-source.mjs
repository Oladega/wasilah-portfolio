import {readFile} from 'node:fs/promises';
import ts from 'typescript';

// Read the same checked-in data used by the application, without maintaining test copies.
export async function contentSource() {
  const load = async (path, imports = {}) => {
    const source = await readFile(path, 'utf8');
    const code = ts.transpileModule(source, {
      compilerOptions: {module: ts.ModuleKind.CommonJS},
    }).outputText;
    const exports = {};
    new Function('exports', 'require', code)(exports, name => {
      if (!(name in imports)) throw new Error(`Unexpected data import: ${name}`);
      return imports[name];
    });
    return exports;
  };
  const profile = await load('src/data/profile.ts');
  const {siteConfig} = await load('src/data/site.ts', {'./profile': profile});
  const {projects} = await load('src/data/projects.ts');
  return {siteConfig, projects, profile: profile.professionalProfile, contacts: profile.contacts};
}
