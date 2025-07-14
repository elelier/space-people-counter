/**
 * API Health Check Service
 * Verifica el estado de las APIs externas utilizadas en la aplicación
 */

export interface ApiStatus {
  name: string;
  url: string;
  status: 'online' | 'offline' | 'slow';
  responseTime: number;
  lastChecked: Date;
  error?: string;
}

export interface HealthCheckResult {
  overall: 'healthy' | 'degraded' | 'down';
  apis: ApiStatus[];
  timestamp: Date;
}

/**
 * Verifica el estado de una API específica
 */
async function checkApiHealth(name: string, url: string, timeout: number = 5000): Promise<ApiStatus> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store'
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      return {
        name,
        url,
        status: responseTime > 3000 ? 'slow' : 'online',
        responseTime,
        lastChecked: new Date()
      };
    } else {
      return {
        name,
        url,
        status: 'offline',
        responseTime,
        lastChecked: new Date(),
        error: `HTTP ${response.status}`
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      name,
      url,
      status: 'offline',
      responseTime,
      lastChecked: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Verifica el estado de todas las APIs utilizadas
 */
export async function checkAllApisHealth(): Promise<HealthCheckResult> {
  const checks = await Promise.all([
    checkApiHealth('ISS Location (wheretheiss.at)', 'https://api.wheretheiss.at/v1/satellites/25544'),
    checkApiHealth('People in Space (open-notify)', 'http://api.open-notify.org/astros.json'),
    checkApiHealth('ISS Location Backup (open-notify)', 'https://api.open-notify.org/iss-now.json')
  ]);

  const onlineCount = checks.filter(check => check.status === 'online').length;
  const slowCount = checks.filter(check => check.status === 'slow').length;
  const offlineCount = checks.filter(check => check.status === 'offline').length;

  let overall: 'healthy' | 'degraded' | 'down';
  
  if (onlineCount >= 2) {
    overall = 'healthy';
  } else if (onlineCount >= 1 || slowCount >= 1) {
    overall = 'degraded';
  } else {
    overall = 'down';
  }

  return {
    overall,
    apis: checks,
    timestamp: new Date()
  };
}

/**
 * Obtiene un reporte de salud simplificado para logging
 */
export function getHealthSummary(result: HealthCheckResult): string {
  const summary = result.apis.map(api => `${api.name}: ${api.status} (${api.responseTime}ms)`).join(', ');
  return `Overall: ${result.overall} | ${summary}`;
}
