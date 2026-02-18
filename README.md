# StreamHUB

Sitio web estático para que fuinciona com odirectorio de creadores/streamers en formato de mini tarjetas y perfil compacto, con buscador, filtros por **tags** y **juegos**.

> Proyecto altamente vibecodeado, está hecho para funcionar bajo la estructura actual. Si cambias nombres de IDs/clases o el schema del JSON, es fácil que algo se rompa.

---

## Demo 
`https://streamhub.kuumedia.com.es/`

---

## Funciones destacables
- Lista de tarjetas responsive (grid).
- Buscador por nombre de usuario.
- Filtros dinámicos por:
  - Tags (desde `creator.tags`)
  - Juegos (desde `creator.games`)
- Contadores por filtro (cuántas personas coinciden con las categorías seleccionadas).
- Popup/modal por persona con:
  - Avatar, usuario, tags, juegos
  - Redes sociales (iconos+links)
  - Botón de acceso rápido al stream “Abrir perfil de Twitch”
  - Selector de tema (day/night/auto basado en hora del equipo (modo oscuro 18:00 y 07:30.))


---

### Estructura de creadores
```json
{
  "id": 1,
  "username": "Nombre",
  "avatar_url": "assets/avatars/Nombre.png",
  "tags": ["Just Chatting", "Vtuber"],
  "games": ["Valorant", "Minecraft"],
  "bio": "Texto opcional",
  "followers": "12345",
  "residence": "Caracas, Venezuela",
  "nationality": "Venezuela",
  "socials": {
    "twitch": "handle",
    "kick": "handle",
    "x": "handle",
    "ig": "handle",
    "youtube": "handle",
    "tiktok": "handle",
    "email": "correo@dominio.com"
  }
}
```
---

### Conocimientos y herramientas necesarias

* Conocimientos ***básicos-intermedios*** de Github, HTML, CSS, JS/JSON.
* Editor de código, no importa si es super básico *(Bloc de notas)*, simple *(Notepad++)* o más completo *(Visual Code)*

## Usabilidad

Si bien es un proyecto libre se apreciaría la mención en caso de ser usado.

## Autor

[Billy Billete](https://billy.kuumedia.com.es/)

## Créditos

* ChatGPT + PerplexityPro

## Descargo de responsabilidad

Este es un proyecto solo por diversión, no lucrativo y sin ninguna intención de tomar créditos por nada. Todas las personas que figuran en la web llenaron un formulario. Cualquier persona que usa el template lo hace bajo su propia responsabilidad.