import type { Category, Container, Shop, Stage } from "@/lib/types";

/** Spanish labels for kits, categories, stores, and stages. Same keys as src/data/meta.ts. */
export const META_ES: {
  container: Record<Container, { name: string; purpose: string; where: string }>;
  category: Record<Category, string>;
  shop: Record<Shop, string>;
  stage: Record<Stage, { name: string; desc: string }>;
} = {
  container: {
    stay: {
      name: "Caja para quedarse en casa",
      purpose:
        "Piense en acampar en casa: sin luz, sin agua de la llave, con las tiendas cerradas y con ayuda que puede tardar en llegar.",
      where: "Guárdela donde pueda alcanzarla después de un terremoto: un clóset cerca de la puerta, no al fondo del garaje.",
    },
    go: {
      name: "Mochila de emergencia",
      purpose:
        "Piense en irse unos días a casa de alguien o a un refugio. Una mochila por persona, lista para tomar en minutos.",
      where:
        "Téngala junto a la puerta. Debe poder cargarla con comodidad, y no empaque nada que no sepa usar.",
    },
    car: {
      name: "Kit para el carro",
      purpose: "Por si se queda atorado en el camino o tiene que irse en carro.",
      where:
        "Guárdelo en la cajuela, fuera de la vista. Mantenga el tanque al menos a la mitad, y no deje copias de sus identificaciones en el carro por si se lo roban.",
    },
    home: {
      name: "Planes y pendientes",
      purpose: "Tareas y planes que se hacen una vez. La mayoría son gratis y toman menos de una hora.",
      where: "",
    },
  },
  category: {
    kit: "Algo donde guardarlo",
    water: "Agua",
    food: "Comida",
    "light-power": "Luz y electricidad",
    comms: "Alertas y comunicación",
    "first-aid": "Primeros auxilios y medicinas",
    sanitation: "Baño e higiene",
    "docs-money": "Documentos y efectivo",
    "clothing-shelter": "Ropa y abrigo",
    tools: "Herramientas",
    air: "Humo y aire",
    "baby-kids": "Bebés y niños",
    pets: "Mascotas",
    access: "Salud y necesidades especiales",
    "home-safety": "Haga su casa más segura",
    comfort: "Comodidad y calma",
    plan: "Haga un plan",
    practice: "Practique",
    community: "Vecinos y comunidad",
    signup: "Inscripciones y papeles",
  },
  shop: {
    free: "Júntelo o hágalo en casa",
    grocery: "Supermercado",
    pharmacy: "Farmacia",
    hardware: "Ferretería",
    outdoor: "Tienda de campismo",
    online: "En línea o en una tienda grande",
  },
  stage: {
    weekend: { name: "Este fin de semana", desc: "Pasos rápidos y gratis. La mayoría toman de 5 a 15 minutos." },
    month: { name: "Este mes", desc: "Junte lo que tiene, empáquelo y haga una o dos compras." },
    later: { name: "Más adelante", desc: "Más días, respaldos y equipo para cuando esté listo." },
  },
};
