'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { SpaceData } from '@/services/spaceApi';

interface ValidationResult {
  timestamp: string;
  apiStatus: 'success' | 'error' | 'loading';
  dataSource: 'api' | 'fallback';
  responseTime: number;
  data?: SpaceData;
  error?: string;
}

export default function ValidationPage() {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateData = async () => {
    setIsValidating(true);
    const startTime = Date.now();
    
    try {
      // Probar la API directamente
      const response = await fetch('/api/space-people');
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (response.ok) {
        const data: SpaceData = await response.json();
        
        setValidation({
          timestamp: new Date().toISOString(),
          apiStatus: 'success',
          dataSource: data.number > 0 ? 'api' : 'fallback',
          responseTime,
          data
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      setValidation({
        timestamp: new Date().toISOString(),
        apiStatus: 'error',
        dataSource: 'fallback',
        responseTime,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    validateData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-4">
          🔍 Validación de Datos Espaciales
        </h1>
        <p className="text-center text-muted-foreground mb-6">
          Verificación en tiempo real de la información sobre personas en el espacio
        </p>
        
        <div className="flex justify-center">
          <Button 
            onClick={validateData} 
            disabled={isValidating}
            className="flex items-center gap-2"
          >
            {isValidating ? '🔄 Validando...' : '🚀 Validar Datos Ahora'}
          </Button>
        </div>
      </div>

      {validation && (
        <div className="space-y-6">
          {/* Estado de la API */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {validation.apiStatus === 'success' ? '✅' : '❌'} Estado de la API
              </CardTitle>
              <CardDescription>
                Última verificación: {new Date(validation.timestamp).toLocaleString('es-ES')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Estado</label>
                  <div>
                    <Badge variant={validation.apiStatus === 'success' ? 'default' : 'destructive'}>
                      {validation.apiStatus === 'success' ? 'Funcionando' : 'Error'}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Fuente de datos</label>
                  <div>
                    <Badge variant={validation.dataSource === 'api' ? 'default' : 'secondary'}>
                      {validation.dataSource === 'api' ? 'API en vivo' : 'Datos de respaldo'}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Tiempo de respuesta</label>
                  <div className="text-sm">
                    {validation.responseTime}ms
                  </div>
                </div>
              </div>
              
              {validation.error && (
                <Alert className="mt-4">
                  <strong>Error:</strong> {validation.error}
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Datos actuales */}
          {validation.data && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  👨‍🚀 Datos Actuales
                </CardTitle>
                <CardDescription>
                  Información obtenida {validation.dataSource === 'api' ? 'de la API oficial' : 'de datos de respaldo'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="text-2xl font-bold text-center">
                    {validation.data.number} personas en el espacio
                  </div>
                </div>
                
                <div className="grid gap-3">
                  {validation.data.people.map((person, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="font-medium">{person.name}</span>
                      <Badge variant="outline">{person.craft}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información sobre las fuentes */}
          <Card>
            <CardHeader>
              <CardTitle>📚 Información sobre las Fuentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">API Principal: Open Notify</h4>
                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                  <li>Fuente: <code>api.open-notify.org/astros.json</code></li>
                  <li>Mantenida manualmente por el creador cuando ocurren lanzamientos y aterrizajes</li>
                  <li>Actualizada en tiempo real con cambios de tripulación</li>
                  <li>Incluye datos de ISS, Tiangong y otras estaciones espaciales</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Datos de Respaldo</h4>
                <p className="text-sm text-muted-foreground">
                  En caso de que la API no esté disponible, se muestran datos de respaldo basados en 
                  la última información conocida de astronauts en la ISS y la estación espacial Tiangong.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Precisión de los Datos</h4>
                <p className="text-sm text-muted-foreground">
                  Los datos son tan precisos como la fuente oficial. Las actualizaciones ocurren 
                  cuando hay cambios reales en el número de personas en el espacio (lanzamientos, 
                  aterrizajes, cambios de tripulación).
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
