// ============================================================
// data.js — Toda la información de la serie
// ============================================================

const SEASONS = {
  s1: {
    id: 's1',
    title: 'Temporada 1',
    fullTitle: 'Chuunibyou demo Koi ga Shitai!',
    year: 2012,
    eps: 12,
    studio: 'Kyoto Animation',
    cover: 's1.jpg',
    accentColor: '#9b59b6',
    description:
      'Yuuta Togashi se avergüenza de su pasado chuunibyou como el "Maestro de la Llama Oscura". Al comenzar el bachillerato conoce a Rikka Takanashi, una chica que vive inmersa en sus propias fantasías. Entre batallas imaginarias y contratos de ojos misteriosos, nace un amor completamente inesperado.',
    episodes: [
      { n: 1,  title: 'Encuentro casual con el malvado Lord Shingan',    driveId: '1LH_ldQPTqCrKiUG9ABfBWd6aOFzvWg8q' },
      { n: 2,  title: 'Sacerdotisa de la melodía',                       driveId: '1c_Lgw8Kn1RST-F_iJq3hTKDGg9XSR0MM' },
      { n: 3,  title: 'La hereje, chica de coletas',                     driveId: '1btT0Bb-zptE8zA0qOF76g3JQBl0wfMli'  },
      { n: 4,  title: 'Arrepentimiento del Mabinogion',                  driveId: '1sSzrtGJ1P-SiJoV7-__wjr06JY3FnyVK'  },
      { n: 5,  title: 'Estudio duro y vinculante',                       driveId: '13wJUzJalwLJ8rhJrOYJsOdIrHcKAyof7'  },
      { n: 6,  title: 'El inocente expiado',                             driveId: '19jVbBjtTNLDYr_YV43ZJlKvoT3gr1Doc'  },
      { n: 7,  title: 'Recuerdos del paraíso perdido',                   driveId: '1-kCMMzfu90bsl1Bq4kBw245feedkcXbP'  },
      { n: 8,  title: 'Exiliados, solo los dos',                         driveId: '1qAPMm5pcUBVA5jxCF_I3CuU2AEVpkS-k'  },
      { n: 9,  title: 'Corazón caótico',                                 driveId: '1GX4LWp-FOaNej0OdgyoGu2EfnQEAoJJk'  },
      { n: 10, title: 'La caja de Pandora de la Santa Madre',            driveId: '1wA71SO0mvU4L2oXq2BKKjV0iQ5t1l3AR'  },
      { n: 11, title: 'Ángel caído de un ala',                           driveId: '1LGDmZsz1U9QZ6OxoO0r_Mt5pz1B1HdGM'  },
      { n: 12, title: 'Compromiso eterno',                               driveId: '1XNf2lz6_gy36ri6Z_qEEtApqReq6ZinO'  },
    ],
  },

  s2: {
    id: 's2',
    title: 'Temporada 2',
    fullTitle: 'Chuunibyou demo Koi ga Shitai! Ren',
    year: 2014,
    eps: 12,
    studio: 'Kyoto Animation',
    cover: 's2.jpg',
    accentColor: '#e91e8c',
    description:
      'Rikka y Yuuta son pareja oficial, pero vivir un romance siendo tan diferentes resulta más complicado de lo esperado. Una nueva chūnibyō aparece reclamando rivalizar con Rikka, poniendo a prueba su relación y sus sentimientos.',
    episodes: [
      { n: 1,  title: 'El malvado Lord Shingan... Renacido',                                     driveId: null },
      { n: 2,  title: 'Delantero del anillo delfín',                                             driveId: null },
      { n: 3,  title: 'Chica diabólica mágica en persecución',                                   driveId: null },
      { n: 4,  title: 'La elección para presidente del consejo estudiantil (Queen Maker)... de pureza', driveId: null },
      { n: 5,  title: 'El ilusorio... laberinto de la siesta',                                   driveId: null },
      { n: 6,  title: 'Viajando a la isla de Tsukushi... de la vacilación',                     driveId: null },
      { n: 7,  title: 'Triángulo... de encuentros perdidos',                                     driveId: null },
      { n: 8,  title: 'El falso... Mori Summer [o Madre Espíritu Santo]',                        driveId: null },
      { n: 9,  title: 'Resort... último recurso',                                                driveId: null },
      { n: 10, title: 'Guantelete de lluvia... o una noche de verano, lluvia y látigos',         driveId: null },
      { n: 11, title: 'Luna Azul Ragnarok',                                                      driveId: null },
      { n: 12, title: 'El contrato superior... del crepúsculo',                                  driveId: null },
    ],
  },

  movie: {
    id: 'movie',
    title: 'Película',
    fullTitle: 'Take On Me',
    year: 2018,
    eps: 1,
    studio: 'Kyoto Animation',
    cover: 'movie.jpg',
    accentColor: '#2980b9',
    description:
      'La conclusión definitiva de la historia. Yuuta y Rikka emprenden un viaje improbable por todo Japón para escapar del plan de la hermana mayor de Rikka de llevársela al extranjero. Una aventura llena de nostalgia, amor desbordante y el mejor final posible.',
    episodes: [
      { n: 1, title: 'Take On Me — Película completa', driveId: null },
    ],
  },
};
