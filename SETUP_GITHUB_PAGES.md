# Configuración rápida: GitHub Pages

## 1) Requisitos
- Repositorio en GitHub
- Workflow en `.github/workflows/pages.yml` (ya incluido)

## 2) Activar GitHub Pages
1. Ve a **Settings → Pages**
2. En **Source**, selecciona **GitHub Actions**
3. Guarda

## 3) Publicar
1. Haz push a `main`
2. Espera que el workflow termine
3. Verifica el sitio en:
   - `https://<tu-usuario>.github.io/<repo>/`
   - Si usas dominio, revisa que `public/CNAME` esté correcto

## 4) Dominio personalizado (si aplica)
1. Asegúrate de que `public/CNAME` tenga: `spacepeople.elelier.com`
2. En **Settings → Pages**, habilita **Enforce HTTPS**

## 5) Verificación rápida
- La página carga
- `robots.txt` y `sitemap.xml` responden
