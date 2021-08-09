export const environment = {
  production: true,
  sitePath: (window as { [key: string]: any })['env']['sitePath'] || '', // 'cbc_3000',
  karmYogiPath: (window as { [key: string]: any })['env']['karmYogiPath'] || '',
  cbpPath: (window as { [key: string]: any })['env']['cbpPath'] || '',
  portalRoles: (((window as { [key: string]: any })['env']['portalRoles'] || '').split(',')) || [],
}
