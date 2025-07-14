# Documentación de Servicios de API (@/services)

## 1. Servicio de Datos de Astronautas (`spaceApi.ts`)

**Interfaz principal:**
```typescript
export interface SpaceData {
  number: number;
  people: AstronautData[];
  message: string;
}

interface AstronautData {
  name: string;
  craft: string;
}
```

**Funciones exportadas:**
- `getPeopleInSpace()`: Obtiene datos sobre personas en el espacio
  - **Retorno**: Promise<SpaceData>
  - **Comportamiento**:
    - Intenta obtener datos de la API externa (Open Notify)
    - Utiliza datos de respaldo si la API falla
    - Control de errores con fallback a datos predeterminados
  - **Implementación**:
    ```typescript
    export async function getPeopleInSpace(): Promise<SpaceData> {
      try {
        // Actualmente usa datos estáticos ya que la API está desactualizada
        // Implementación real comentada que usaría fetch a Open Notify
        return fallbackData;
      } catch (error) {
        console.error('Failed to fetch people in space:', error);
        return fallbackData;
      }
    }
    ```

## 2. Servicio de Ubicación de la ISS (`issLocationApi.ts`)

**Interfaz principal:**
```typescript
export interface ISSLocationData {
  iss_position: {
    latitude: string;
    longitude: string;
  };
  message: string;
  timestamp: number;
}
```

**Funciones exportadas:**
- `getISSLocation()`: Obtiene la ubicación actual de la ISS
  - **Retorno**: Promise<ISSLocationData>
  - **Comportamiento**:
    - Sistema de múltiples intentos con diferentes APIs
    - Primera opción: API de wheretheiss.at
    - Segunda opción: API de Open Notify
    - Fallback a ubicaciones calculadas si ambas APIs fallan
  - **Implementación**:
    ```typescript
    export async function getISSLocation(): Promise<ISSLocationData> {
      try {
        // 1. Intento con wheretheiss.at
        try {
          const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
          if (response.ok) {
            const data = await response.json();
            return {
              message: "success",
              timestamp: Date.now(),
              iss_position: {
                latitude: data.latitude.toString(),
                longitude: data.longitude.toString()
              }
            };
          }
        } catch (error) {
          console.error('First API attempt failed:', error);
        }

        // 2. Intento con Open Notify
        try {
          const response = await fetch('https://api.open-notify.org/iss-now.json');
          if (response.ok) {
            const data = await response.json();
            if (data.message === "success") {
              return data;
            }
          }
        } catch (error) {
          console.error('Second API attempt failed:', error);
        }

        // 3. Usar ubicación calculada si ambas fallan
        const fallbackPosition = getFallbackLocation();
        return {
          message: "success (fallback)",
          timestamp: Date.now(),
          iss_position: fallbackPosition
        };
      } catch (error) {
        console.error('Failed to fetch ISS location:', error);
        return {
          message: "error",
          timestamp: Date.now(),
          iss_position: {
            latitude: "0",
            longitude: "0"
          }
        };
      }
    }
    ```

**Funciones auxiliares:**
- `getFallbackLocation()`: Genera ubicaciones simuladas para la ISS
  - Calcula posiciones basadas en órbitas de 90 minutos
  - Utiliza un array de coordenadas predefinidas para simular el movimiento

## 3. Servicio de Datos de Misiones (`missionData.ts`)

**Interfaz principal:**
```typescript
export interface MissionDetailedData {
  name: string;
  craft: string;
  role: string;
  flag: string;
  nationality: string;
  bio: string;
  mission_start: string;
  mission_duration: string;
  previous_missions: string[];
  fun_fact: string;
  image?: string;
  progress: number;
}
```

**Funciones exportadas:**
- `getMissionDetails(astronautName: string)`: Obtiene detalles de la misión de un astronauta
  - **Retorno**: MissionDetailedData | undefined
  - **Comportamiento**:
    - Busca en los datos predefinidos por nombre de astronauta
    - Retorna undefined si no se encuentra información
  - **Implementación**:
    ```typescript
    export function getMissionDetails(astronautName: string): MissionDetailedData | undefined {
      return missionDetails.find(
        mission => mission.name.toLowerCase() === astronautName.toLowerCase()
      );
    }
    ```

## Llamadas desde Componentes

### En Componente SpaceCounter
```typescript
const fetchData = useCallback(async () => {
  try {
    setLoading(true);
    setError(false);

    const response = await fetch('/api/space-people');

    if (!response.ok) {
      throw new Error('Error en la respuesta del API');
    }

    const newData = await response.json();

    if (newData.message === 'error') {
      throw new Error('Error en los datos recibidos');
    }

    setData(newData);
    setAnimateNumber(true);
    setTimeout(() => setAnimateNumber(false), 1000);
  } catch (error) {
    console.error('Error refreshing data:', error);
    setError(true);
  } finally {
    setLoading(false);
  }
}, []);
```

### En Componente ISSMap
```typescript
const fetchISSLocation = useCallback(async () => {
  try {
    setLoading(true);
    const response = await fetch('/api/iss-location');

    if (!response.ok) {
      throw new Error('Error en la respuesta de la API');
    }

    const data = await response.json();
    setIssLocation(data);

    // Actualizar timestamp en el cliente
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    setLastUpdated(`${hours}:${minutes}:${seconds}`);

    if (mapError) setMapError(false);
  } catch (error) {
    console.error('Error fetching ISS location:', error);
    setMapError(true);
  } finally {
    setLoading(false);
  }
}, [mapError]);
```
