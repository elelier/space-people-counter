# Space People Counter

Proyecto para visualizar en tiempo real cuántas personas hay en el espacio exterior y sus misiones actuales.

## Funcionalidades

### Cambio de Temas

El proyecto implementa un sistema de cambio de temas que permite alternar entre dos estilos visuales:

- **Tema Espacio**: Tema por defecto con colores azules profundos que simulan el espacio exterior, con texto en color claro.
- **Tema Star Wars**: Tema alternativo con fondo negro y texto en amarillo característico de Star Wars.

La implementación del cambio de temas se realiza mediante un botón en la barra de navegación que:

1. Mantiene un estado local (`isStarWars`) que determina el tema actual.
2. Al hacer clic en el botón, se invierte este estado.
3. Dependiendo del estado, se aplican diferentes estilos CSS al documento:
   - Para el tema Espacio: fondo azul oscuro (#070d1b) y texto blanco/azul claro.
   - Para el tema Star Wars: fondo negro (#000) y texto amarillo (#ffe81f).

#### Implementación técnica

El cambio de temas se implementa utilizando un componente React simple:

```tsx
function MinimalButton() {
  const [isStarWars, setIsStarWars] = useState(false);

  function handleClick() {
    const newState = !isStarWars;
    setIsStarWars(newState);

    // Cambiar estilos globales
    if (newState) {
      // Tema Star Wars
      document.body.style.backgroundColor = '#000';
      document.body.style.color = '#ffe81f';
    } else {
      // Tema Espacio
      document.body.style.backgroundColor = '#070d1b';
      document.body.style.color = '#e1e8f0';
    }
  }

  // Estilos específicos según el tema
  const currentStyle = isStarWars
    ? { backgroundColor: 'black', color: '#ffe81f', border: '1px solid #ffe81f' }
    : { backgroundColor: '#3b82f6', color: 'white' };

  return (
    <button onClick={handleClick} style={currentStyle}>
      {isStarWars ? "Cambiar a Espacio" : "Cambiar a Star Wars"}
    </button>
  );
}
```

Este componente se integra en la barra de navegación, permitiendo un acceso rápido al cambio de tema desde cualquier parte de la aplicación.

### Otras funcionalidades

- **Contador de personas**: Muestra en tiempo real cuántas personas están actualmente en el espacio.
- **Misiones Activas**: Lista de astronautas actualmente en misión con información detallada.
- **Mapa de la ISS**: Visualización en tiempo real de la ubicación de la Estación Espacial Internacional.
- **Información de Estaciones**: Datos sobre las principales estaciones espaciales actualmente en órbita.

## Tecnologías Utilizadas

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion (para animaciones)
- API de personas en el espacio (Open Notify)
- API de ubicación de la ISS
