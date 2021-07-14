export const environment = {
  production: true,
  sitePath: (window as { [key: string]: any })['env']['apiUrl'] || 'default', // 'cbc_3000',
  karmYogiPath: (window as { [key: string]: any })['env']['apiUrl'] || '',
  cbpPath: (window as { [key: string]: any })['env']['apiUrl'] || '',
}
