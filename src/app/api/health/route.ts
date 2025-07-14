import { NextResponse } from "next/server";
import { checkAllApisHealth, getHealthSummary } from "@/services/apiHealthCheck";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const healthCheck = await checkAllApisHealth();
    
    // Log del estado para debugging
    console.log(`[API Health Check] ${getHealthSummary(healthCheck)}`);
    
    // Determinar el código de estado HTTP basado en la salud general
    let statusCode = 200;
    if (healthCheck.overall === 'degraded') {
      statusCode = 207; // Multi-Status
    } else if (healthCheck.overall === 'down') {
      statusCode = 503; // Service Unavailable
    }
    
    return NextResponse.json(healthCheck, { status: statusCode });
  } catch (error) {
    console.error("Error checking API health:", error);
    
    return NextResponse.json({
      overall: 'down',
      apis: [],
      timestamp: new Date(),
      error: 'Health check failed'
    }, { status: 500 });
  }
}
