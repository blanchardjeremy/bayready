/**
 * Spanish text for each item in src/data/items.ts, by id: the name, why, and tip.
 * `examples` are the example products' labels, in the same order as the item's
 * examples (product names stay as they are). Quantities, units, and link labels
 * are built in items.ts from ctx.lang. A test checks that every item has an entry here.
 */
export const ITEMS_ES: Record<string, { name: string; why: string; tip?: string; examples?: string[] }> = {
  // ----- En la casa: planes y tareas de una vez --------------------------------
  alerts: {
    name: "Inscríbase en las alertas de emergencia de su condado",
    why: "Mensajes y llamadas gratis sobre evacuaciones, incendios y otras emergencias cerca de usted. Inscribirse toma un par de minutos, y así es como su condado le avisa sobre su propia dirección.",
    tip: "Inscríbase con la dirección de su casa, y también la del trabajo o la escuela si están en otro condado.",
  },
  contact: {
    name: "Escoja un contacto fuera del área y dos puntos de encuentro",
    why: "Pídale a alguien que viva fuera del Área de la Bahía que sea la persona a quien todos le manden mensajes. Luego escojan dos puntos de encuentro: uno justo afuera de la casa, y otro fuera de su vecindario por si no pueden llegar a casa.",
    tip: "Después de un terremoto fuerte, las líneas locales se saturan, pero un mensaje de texto a alguien lejos muchas veces sí llega, y esa persona puede pasar noticias entre ustedes. Decidan quién recoge a los niños y a las mascotas si usted no puede llegar a casa. Repasen el plan una vez al año.",
  },
  "group-text": {
    name: "Haga un chat de grupo de la casa y acuerden un mensaje para avisar que están bien",
    why: "Un solo chat para todos en la casa, más su contacto fuera del área. Acuerden mensajes cortos, como \"Bien, en casa\" o \"Bien, voy al punto de encuentro\", para que un solo mensaje lo diga todo.",
    tip: "Los mensajes de texto muchas veces llegan cuando las llamadas no, y gastan menos batería.",
  },
  "wallet-cards": {
    name: "Haga una tarjeta para la cartera para cada persona",
    why: "Una tarjeta pequeña con su contacto fuera del área, los puntos de encuentro y los números importantes, para que tenga el plan con usted aunque el celular no tenga batería. Use las tarjetas para la cartera de su PDF.",
    tip: "Los niños guardan la suya en la mochila. Cambie las tarjetas cuando cambie un número.",
  },
  neighbor: {
    name: "Intercambie números con un vecino",
    why: "Después de un desastre grande, la mayor parte de la ayuda viene de la gente que vive cerca. Intercambien números y quedan en mandarse un mensaje después de un terremoto, un incendio o un apagón largo.",
    tip: "Pregunte qué les ayudaría a ellos y diga qué le ayudaría a usted, como una llave de repuesto, cuidar a una mascota o un aventón. Si alguien cerca vive solo, pregúntele si le gustaría que usted le hablara para ver cómo está.",
  },
  "doc-photos": {
    name: "Tómele fotos a sus identificaciones, seguros y recetas médicas",
    why: "Si pierde la cartera o tiene que salir rápido, tener una copia segura le facilita mucho pedir ayuda, surtir sus medicinas y hacer reclamos al seguro.",
    tip: "Guárdelas en un lugar protegido con contraseña que pueda abrir desde cualquier aparato.",
  },
  tetanus: {
    name: "Revise que todos tengan al día la vacuna contra el tétanos",
    why: "Las cortadas con vidrio, escombros y agua de inundación pueden causar tétanos. Los adultos necesitan un refuerzo cada 10 años, y antes si se hacen una herida sucia y ya pasaron 5 años.",
    tip: "¿No sabe cuándo fue la última? Pregúntele a su doctor o en la farmacia. Los niños la reciben con sus vacunas de siempre.",
  },
  "first-aid-class": {
    name: "Que un adulto tome una clase de RCP o de Stop the Bleed",
    why: "Después de un desastre grande, la ayuda puede tardar horas. Saber cómo detener un sangrado fuerte o dar RCP puede salvar a alguien antes de que llegue.",
    tip: "Las clases de Stop the Bleed (detener el sangrado) duran como una hora y muchas son gratis. Los bomberos y la Cruz Roja enseñan RCP. Para empezar, basta con una persona en su casa.",
  },
  "evac-zone": {
    name: "Busque su zona de evacuación",
    why: "Las alertas de evacuación se dan por zona. Si conoce la suya, sabrá de inmediato cuando una alerta es para usted.",
    tip: "Una Advertencia de evacuación quiere decir que se prepare, y que salga ya si necesita más tiempo: niños pequeños, mascotas, necesidades de salud o si no tiene carro. Una Orden de evacuación quiere decir que salga ya. En algunos incendios no hay advertencia.",
  },
  "pge-alerts": {
    name: "Inscríbase en las alertas de apagones de PG&E para su dirección",
    why: "PG&E trata de avisar uno o dos días antes de un corte de luz planeado, pero a veces avisa solo unas horas antes. No necesita cuenta de PG&E, así que los inquilinos también se pueden inscribir.",
    tip: "Puede agregar más de una dirección, como la del trabajo, la escuela o la casa de sus papás.",
  },
  "medical-baseline": {
    name: "Solicite el programa Medical Baseline de PG&E",
    why: "Es para personas que dependen de aparatos médicos eléctricos u oxígeno, o que necesitan calefacción o aire acondicionado por una condición de salud. Le baja la tarifa y le dan avisos adicionales antes de los cortes de luz planeados. Su doctor firma el formulario.",
    tip: "Una vez inscrito, conteste las llamadas de PG&E antes de un corte planeado. Si nadie contesta, mandan a alguien a tocar la puerta.",
  },
  ddar: {
    name: "Vea si califica para una batería de respaldo gratis",
    why: "El programa de PG&E para personas con discapacidades (DDAR) puede ayudar durante los cortes de luz planeados con transporte accesible, noches de hotel y a veces una batería portátil. No toman en cuenta sus ingresos.",
    tip: "Hay pocas baterías gratis y casi todas son para personas en zonas de alto riesgo de incendio o que ya han tenido cortes planeados. Pregunte antes de comprar una.",
  },
  "oxygen-safety": {
    name: "Haga su casa segura para el oxígeno",
    why: "Con oxígeno, el fuego empieza fácil y se extiende rápido. Nada de velas, cigarros ni llamas en la casa, y mantenga los tanques y las mangueras a por lo menos 10 pies de estufas, asadores y calentadores.",
    tip: "En un apagón, use linternas, nunca velas. Si alguien cocina en una estufa de campamento, que lo haga afuera, bien lejos de la persona que usa oxígeno y de los tanques. Mantenga los tanques parados, asegurados y fuera del sol.",
  },
  "evac-help": {
    name: "Planee quién le ayuda a salir, y cómo",
    why: "Los elevadores se paran, las calles se llenan y la ayuda puede tardar. Arregle con dos personas que vendrían por usted, cómo bajaría las escaleras y saldría, y adónde iría. Practíquelo una vez.",
    tip: "Cuando haya una Advertencia de evacuación, salga en ese momento. No espere una orden. Dígales a quienes le van a ayudar dónde están su mochila de emergencia, sus medicinas y su equipo. ¿No tiene carro? Pida un aventón desde ahora y conozca sus opciones de autobús o paratránsito.",
  },
  "support-network": {
    name: "Busque a unas personas que vendrían a ver cómo está",
    why: "Escoja a dos o tres personas cerca, como un vecino, un amigo o alguien del trabajo, que vendrían a ver cómo está después de un desastre. Dígales qué ayuda podría necesitar.",
    tip: "No dependa de una sola persona, ni solo de ayuda pagada, porque tal vez no puedan llegar. Enséñele a alguien cómo funciona su equipo, y piense en darle una llave.",
  },
  "health-general": {
    name: "Si alguien toma medicinas o usa equipo médico, planee para eso",
    why: "Las farmacias y la luz pueden faltar por un tiempo. Tenga una semana o más de medicinas y artículos extra, una lista escrita de medicinas y dosis, y una forma de darle electricidad al equipo.",
    tip: "Pregunte en la farmacia o a su doctor cómo conseguir más con tiempo. Si nadie en su casa lo necesita, omita esto.",
  },
  "comm-access": {
    name: "Configure las alertas y el 911 para que le funcionen a usted",
    why: "Llame al 911 si puede, y si no, mande un mensaje de texto: el texto al 911 funciona en todo California. Active las alertas con luz y vibración en la configuración de accesibilidad de su celular, y busque una alarma de humo con luz intermitente o con vibrador para la cama.",
    tip: "Ponga papel y pluma o una tarjeta de comunicación en su mochila. Una lámpara de baterías ilumina el cuarto para que pueda leer los labios o usar señas en la oscuridad.",
  },
  "cognitive-plan": {
    name: "Asegúrese de que alguien que se puede confundir nunca se quede solo",
    why: "El estrés y los cambios pueden empeorar la confusión, y algunas personas se salen y se pierden. Acuerden quién se queda con esa persona todo el tiempo, y quién la cuida si esa persona se lastima o no está.",
    tip: "Ponga en su mochila una pulsera de identificación con su número, una foto reciente y algunas cosas conocidas que le den tranquilidad. Practicar con calma y de forma sencilla ayuda.",
  },
  "caregiver-plan": {
    name: "Haga un plan de respaldo para el cuidado diario",
    why: "Si la persona que da el cuidado no puede llegar, ¿quién lo hace? Busque a alguien de respaldo, y escriba la rutina diaria, las medicinas y el equipo para que alguien nuevo pueda ayudar.",
    tip: "Pregúntele a su agencia de salud en el hogar o a su proveedor de IHSS cuál es su plan de emergencia y cómo se comunicarían con usted.",
  },
  "dialysis-plan": {
    name: "Pídale a su equipo médico su plan de emergencia para la diálisis",
    why: "Pida la dieta de emergencia de 3 días, que limita el potasio, la sal y los líquidos, y guarde esa comida en su caja. Pregunte en su clínica cuál es su plan de respaldo: adónde iría usted si la clínica cierra, y cómo se comunicarían con usted.",
    tip: "¿No puede comunicarse con su clínica después de un desastre? Llame a la línea para pacientes de KCER al 866-901-3773. Guarde su horario de tratamiento y sus análisis recientes con su información médica.",
  },
  "pregnancy-plan": {
    name: "Si está embarazada: empaque vitaminas, su expediente y el número de su proveedor",
    why: "Ponga con sus provisiones las vitaminas prenatales, cualquier medicina y una copia de su expediente prenatal. Guarde el número de su proveedor para después de horas y la dirección del hospital donde piensa dar a luz.",
    tip: "Guarde agua extra: va a necesitar más de un galón al día, sobre todo con calor o humo. Cerca de la fecha del parto, planee cómo llegaría al hospital si las calles están cerradas.",
  },
  "service-animal": {
    name: "Empaque para su animal de servicio",
    why: "Guarde su comida, agua, un plato, cualquier medicina, su cartilla de vacunas y su identificación con su propia mochila de emergencia. Los animales de servicio pueden entrar a los refugios, aunque no acepten mascotas.",
    tip: "Agregue una correa, bolsas para los desechos y una foto de los dos juntos por si se separan.",
  },
  "shoes-bed": {
    name: "Tenga zapatos, una linterna y un silbato junto a cada cama",
    why: "Los terremotos de noche rompen vidrios, y la luz se va de inmediato. Un silbato ayuda a los rescatistas a encontrarlo si queda atrapado.",
    tip: "Póngalos en una bolsita amarrada a la pata de la cama para que no se resbale lejos. Agregue lentes de repuesto si usa.",
  },
  shutoffs: {
    name: "Encuentre las llaves de paso del gas, el agua y la luz",
    why: "Cierre el gas solo si huele a gas o escucha un silbido. Una vez cerrado, solo PG&E lo puede volver a abrir, y después de un terremoto fuerte eso puede tardar semanas.",
    tip: "En una casa, tenga una llave inglesa junto al medidor de gas, cuesta unos $15. En un apartamento, pregúntele al administrador del edificio dónde están y quién se encarga. Si se rompen las tuberías después de un terremoto, cierre la llave de paso principal del agua para que no entre agua sucia a la tubería.",
  },
  "smoke-alarms": {
    name: "Pruebe las alarmas de humo y ponga una alarma de monóxido de carbono",
    why: "Los incendios son comunes después de los terremotos y durante los apagones. Los generadores, asadores y calentadores de gas que se usan en los apagones causan intoxicación por monóxido de carbono.",
    tip: "Apriete el botón de prueba cada mes. Cambie las alarmas de humo a los 10 años, y las de monóxido de carbono (CO) para la fecha que dice atrás, por lo general de 7 a 10 años. Ponga una alarma de CO con batería de respaldo cerca de donde duermen. Planee dos salidas de cada cuarto.",
  },
  "clean-room": {
    name: "Escoja un cuarto para que sea su cuarto de aire limpio",
    why: "En días con humo, cierre ventanas y puertas, prenda un filtro en un cuarto y pase ahí la mayor parte del tiempo, sobre todo para dormir.",
    tip: "Escoja un cuarto con pocas ventanas. Revise el aire con la aplicación AirNow y cierre todo antes de que llegue el humo. Ponga el aire acondicionado o la ventilación del carro en recirculación.",
  },
  "cool-place": {
    name: "Escoja un lugar fresco adonde ir en una ola de calor",
    why: "Una biblioteca, un centro comercial o un centro de enfriamiento del condado. Si adentro hace más de unos 85°F, vaya. Golpe de calor: confusión, desmayo o temperatura de 103°F o más, con la piel caliente, que puede estar seca o sudada. Llame al 911 y enfríe a la persona de inmediato: llévela a un lugar fresco, mójele la piel con agua y échele aire.",
    tip: "Primero viene el agotamiento por calor: mucho sudor, piel fría y pegajosa, náuseas y mareo. Descanse en un lugar fresco y tome agua a sorbos. Si adentro hace más de unos 90°F, un ventilador solo puede empeorar las cosas. Algunas medicinas aumentan el riesgo con el calor, como las pastillas para orinar (diuréticos) y algunas medicinas para la presión y psiquiátricas, así que pregúntele a su farmacéutico. En una ola de calor, pregunte a los vecinos que viven solos si quieren que les hable para ver cómo están.",
  },
  "garage-door": {
    name: "Si tiene puerta eléctrica de cochera, aprenda a abrirla a mano",
    why: "En un apagón, el motor de la puerta no funciona. Ha habido personas atrapadas al tratar de evacuar por incendios.",
  },
  drains: {
    name: "Limpie las canaletas y la alcantarilla cerca de su casa",
    why: "Las alcantarillas tapadas son una causa principal de inundaciones en calles y sótanos durante los ríos atmosféricos.",
    tip: "Muchas ciudades regalan sacos de arena antes de las tormentas. Suba las cosas de valor del piso. Nunca maneje ni camine por agua de inundación: seis pulgadas de agua en movimiento lo pueden tumbar, y un pie de agua puede arrastrar un carro.",
  },
  defensible: {
    name: "Quite lo que se pueda quemar a 5 pies alrededor de su casa",
    why: "Las brasas causan la mayoría de los incendios de casas. Las hojas secas, el mantillo (mulch), la leña y los tapetes pegados a la casa son los culpables de siempre.",
  },
  "pet-tags": {
    name: "Actualice las placas de sus mascotas y los datos de su microchip",
    why: "Las mascotas muchas veces salen corriendo en terremotos y evacuaciones. Tener sus datos al día es la mejor forma de recuperarlas.",
    tip: "Pídale a un vecino que saque a sus mascotas si usted no está, y apunte algunos hoteles fuera del área que acepten mascotas. La ASPCA manda gratis una calcomanía para la ventana que dice a los rescatistas cuántas mascotas hay adentro.",
  },
  "secure-furniture": {
    name: "Asegure los muebles altos a la pared y ponga las cosas pesadas abajo",
    why: "Los libreros, televisiones y objetos pesados que caen sobre camas y sillones causan muchas heridas en casa durante los terremotos, sobre todo a los niños.",
    tip: "Ponga seguros en los gabinetes de la cocina y masilla para museos debajo de las cosas que se rompen. Los inquilinos casi siempre pueden usar correas con agujeritos de tornillo. Pregúntele primero al dueño.",
  },
  extinguisher: {
    name: "Extintor de incendios",
    why: "Un fuego pequeño se puede apagar antes de que se extienda. Téngalo en la cocina y aprenda a usarlo: jale el seguro, apunte a la base del fuego, apriete la manija y mueva de lado a lado.",
    tip: "Compre uno clasificado ABC, de por lo menos 2-A:10-B:C, y revise el indicador una vez al año. Una manta contra incendios es un buen extra para la cocina.",
  },
  "water-heater": {
    name: "Asegúrese de que su calentador de agua esté sujeto con correas",
    why: "La ley de California lo exige. Un calentador que se cae puede romper la línea del gas y causar un incendio. Si se queda parado, sus 30 a 50 galones se pueden usar para el escusado y para limpiar.",
    tip: "Si renta, poner las correas le toca al dueño. Pídale que lo revise. Las compañías de agua no están de acuerdo sobre si se puede tomar el agua del calentador (EBMUD dice que no), así que siga lo que diga la suya.",
  },
  retrofit: {
    name: "Averigüe si su casa necesita un refuerzo sísmico",
    why: "Las casas de madera antiguas se pueden salir de sus cimientos. Los dueños pueden recibir hasta $3,000 del programa Earthquake Brace + Bolt de California. Si renta, pregúntele al dueño si ya se hizo.",
    tip: "Las inscripciones para el dinero abren por unas semanas casi todos los años. Inscríbase en el sitio para que le avisen cuándo.",
  },
  insurance: {
    name: "Revise sus seguros",
    why: "Las pólizas normales de casa y de inquilino no cubren daños por terremoto ni por inundación. Las pólizas para inquilinos de la Autoridad de Terremotos de California (CEA) empiezan en unos $35 al año y ayudan a pagar dónde quedarse.",
    tip: "Inquilinos: el seguro del dueño no cubre sus cosas. Vea si está en una zona de inundación en msc.fema.gov. El seguro de inundación casi siempre tarda 30 días en empezar, así que cómprelo antes de la temporada de lluvias.",
  },
  "home-inventory": {
    name: "Grabe un video recorriendo su casa",
    why: "Abra clósets y cajones y diga qué es cada cosa mientras graba. Le facilita mucho el reclamo al seguro si lo pierde todo.",
    tip: "Guárdelo fuera de la casa, como en la nube o en un correo a un familiar. Vuelva a grabarlo una vez al año.",
  },
  "soft-story": {
    name: "Averigüe si su edificio es de \"piso blando\" (soft-story) y si ya lo reforzaron",
    why: "Los edificios de madera con estacionamiento o tiendas en la planta baja se pueden derrumbar en un terremoto fuerte. Como medio millón de personas en el Área de la Bahía viven en ellos. Muchas ciudades exigen reforzarlos.",
    tip: "Pregúntele al dueño o a la asociación de propietarios (HOA), o busque su dirección en la lista de edificios de piso blando de su ciudad. Si no lo han reforzado, tenga una mochila de emergencia y considere un seguro contra terremotos.",
  },
  "ember-vents": {
    name: "Cubra las rejillas del ático y de debajo de la casa con malla de metal fina",
    why: "Las brasas que entran por las rejillas son una de las formas principales en que se queman las casas. Una malla de metal con agujeros de 1/8 de pulgada o más chicos no las deja pasar. La tela de mosquitero normal y la malla de plástico no sirven.",
    tip: "Cuesta unos $5 a $15 por rejilla. Si renta, pregúntele al dueño.",
  },
  "work-kit": {
    name: "Tenga un kit pequeño en el trabajo o la escuela",
    why: "Si hay un terremoto cuando está fuera, los puentes y BART pueden cerrar por un rato. Tenga zapatos para caminar, agua, botanas, un día de sus medicinas y un cargador de celular en su escritorio o casillero.",
    tip: "Marque el camino a pie a su casa en su mapa de papel.",
  },
  "freezer-water": {
    name: "Llene el espacio vacío del congelador con botellas de agua",
    why: "Un congelador lleno se mantiene frío más tiempo, y las botellas congeladas se vuelven agua para tomar cuando se descongelan.",
  },
  "drop-cover": {
    name: "Practique Agáchese, cúbrase y sujétese",
    why: "Agáchese sobre las manos y las rodillas, cúbrase la cabeza y el cuello debajo de una mesa firme, y sujétese hasta que pare el temblor. No salga corriendo.",
    tip: "¿Está en la cama? Quédese ahí y cúbrase la cabeza con una almohada. ¿Usa silla de ruedas? Póngale el freno y cúbrase la cabeza y el cuello. Practiquen una vez todos en la casa. El simulacro del Gran ShakeOut es el tercer jueves de octubre, un buen día para invitar a los vecinos.",
  },
  "practice-text": {
    name: "Mande un mensaje de prueba a su contacto fuera del área",
    why: "Mande su mensaje de que están bien y pídale que le conteste. Toma dos minutos, y sabrá que el plan funciona antes de necesitarlo.",
  },
  "practice-meet": {
    name: "Caminen juntos a sus puntos de encuentro",
    why: "Caminen una vez a los dos puntos, todos juntos, para que nadie tenga que averiguar el camino después de un desastre. Toma unos 20 minutos.",
    tip: "Enséñeles a los niños puntos de referencia, y acuerden qué hacer si un punto está bloqueado.",
  },
  "practice-leave": {
    name: "Practiquen salir en 10 minutos",
    why: "Ponga un temporizador de 10 minutos. Tomen las mochilas de emergencia, las medicinas, los cargadores, los papeles y las mascotas, y salgan todos por la puerta o súbanse al carro. Luego hablen de qué los retrasó.",
    tip: "Las mascotas se esconden cuando hay alboroto, así que practique meterlas en sus transportadoras. Junio, antes de la temporada de incendios, es buen momento para repetirlo.",
  },
  "practice-fire": {
    name: "Hagan un simulacro de incendio de noche, con dos salidas",
    why: "Una vez, cuando ya esté oscuro: apriete el botón de prueba de la alarma de humo y que todos salgan de su recámara y se reúnan afuera. Luego háganlo otra vez usando la segunda salida. Toma unos 10 minutos.",
    tip: "Los niños pueden seguir dormidos aunque suene la alarma de humo, así que acuerden qué adulto va por ellos. En un edificio de apartamentos, usen las escaleras, nunca el elevador.",
  },
  "ok-help-sign": {
    name: "Imprima un letrero de OK / AYUDA para su ventana",
    why: "Después de un terremoto fuerte, un letrero en la ventana les dice a sus vecinos quién necesita ayuda primero, así quien recorra la cuadra puede pasar de largo las casas donde todos están bien.",
    tip: "Téngalo junto a la puerta de entrada con un poco de cinta, y dígales a los vecinos que conoce que se fijen en él. Ponga AYUDA aunque no pueda llegar a la puerta.",
  },
  "fridge-thermo": {
    name: "Termómetros para el refrigerador y el congelador",
    why: "Mantenga las puertas cerradas: un refrigerador cerrado se mantiene frío unas 4 horas, y un congelador lleno unas 48. Tire la comida que haya estado a 40°F o más por más de 2 horas.",
  },
  "red-flag": {
    name: "Haga un plan para incendios: dos salidas y una lista de lo que hay que llevar",
    why: "Conozca dos salidas de su vecindario y pegue una lista de lo que hay que llevar adentro de un clóset. En días de Advertencia de Bandera Roja (clima de incendio extremo), ponga su mochila de emergencia en el carro y mantenga el tanque por lo menos a la mitad.",
    tip: "Las \"seis P\" de CAL FIRE para la lista: personas y mascotas, papeles, recetas y medicinas, fotos, computadora personal y \"plástico\" (tarjetas y efectivo). Si no se siente seguro, váyase. No espere una orden. Con niños pequeños, mascotas o alguien que necesita ayuda para moverse, salga con la advertencia.",
  },
  "half-tank": {
    name: "Acostúmbrese a mantener el tanque de gasolina por lo menos a la mitad",
    why: "Las bombas de gasolina necesitan electricidad, y se hacen filas largas antes de las evacuaciones y después de los terremotos fuertes. Con medio tanque puede salir bien lejos del área.",
    tip: "¿Carro eléctrico? Manténgalo cargado a más de la mitad, sobre todo antes de los días de Bandera Roja y de las tormentas fuertes.",
  },
  routes: {
    name: "Planee cómo saldría sin carro",
    why: "Salga con el primer aviso en vez de esperar una orden. Pregúntele desde ahora a un vecino con carro si se podría ir con él, y conozca la ruta de autobús o de BART más cercana para salir.",
  },
  "tsunami-route": {
    name: "Revise su zona de tsunami y camine su ruta a terreno alto",
    why: "Revise dónde vive, trabaja y estudia, y salga de la zona marcada en el mapa. Si no hay mapa, busque llegar a 100 pies sobre el nivel del mar o 2 millas tierra adentro, a pie si puede, porque las calles se llenan. Si en la costa siente un terremoto largo o fuerte, o ve que el agua se retira, váyase de inmediato. No espere una alerta.",
    tip: "¿No puede caminar tan lejos? Arregle un aventón con tiempo. Como último recurso, suba al tercer piso o más alto de un edificio firme de concreto. Para un tsunami que viene de lejos hay horas de aviso, así que siga las órdenes oficiales.",
  },
  landslide: {
    name: "Aprenda las señales de aviso de un deslave",
    why: "Grietas nuevas en el suelo o en el pavimento, árboles o postes que se inclinan, puertas que de repente se atoran, o arroyos que se ponen lodosos. Salga temprano si vive en una pendiente empinada o cerca de una zona quemada.",
  },
  "shelter-steps": {
    name: "Aprenda a resguardarse adentro (shelter in place)",
    why: "Entre a la casa, cierre con seguro ventanas y puertas, apague la calefacción, el aire acondicionado y los ventiladores, cierre el tiro de la chimenea y selle las rendijas. Espere el aviso de que ya pasó el peligro por la radio o las alertas.",
    tip: "Las mascarillas N95 no filtran los gases químicos. Lo que protege es quedarse adentro con todo sellado.",
  },
  "school-plan": {
    name: "Conozca el plan de la escuela o guardería para recoger a sus hijos",
    why: "Las escuelas y guarderías cuidan a los niños hasta que los recoge un adulto que esté en su tarjeta de emergencia. Para cada niño, llene la tarjeta otra vez cada año escolar, con por lo menos una persona que no tenga que cruzar un puente. Lleve una identificación con foto cuando vaya por ellos.",
    tip: "Después de un terremoto, no llame ni corra a la escuela. Las escuelas tienen planes para cuidar a los niños hasta que llegue alguien de la tarjeta, y las llamadas saturan las líneas. Pregunte desde ahora cómo se comunicará la escuela con los papás, y adónde irían los niños si la escuela los cambia de lugar.",
  },
  "kids-ready": {
    name: "Prepare a los niños: su propia mochila, un número de teléfono y una tarea",
    why: "Deje que los niños ayuden a empacar su propia mochila con algo que los consuele y botanas que les gusten. Ayude a cada uno a aprenderse de memoria un número de teléfono, y deles una tarea, como tomar la linterna o la correa de la mascota.",
    tip: "Tener una tarea ayuda a los niños a sentir más control cuando las cosas dan miedo.",
  },
  "high-rise": {
    name: "Conozca el plan de emergencia y las escaleras de su edificio",
    why: "Los elevadores se paran después de los terremotos y en los apagones. Conozca las escaleras y dónde se reunirían afuera, y tenga zapatos y una linterna junto a la puerta.",
    tip: "Si alguien no puede usar las escaleras, hagan un plan con esa persona y algunos vecinos con tiempo.",
  },
  training: {
    name: "Tome una clase gratis de CERT",
    why: "Aprenderá primeros auxilios, cómo apagar fuegos pequeños y cómo ayudar a los vecinos de forma segura hasta que lleguen los equipos de emergencia. Es gratis en casi toda el Área de la Bahía. En San Francisco se llama NERT, y en Oakland, CORE.",
    tip: "¿Tiene poco tiempo? Una clase de primeros auxilios y RCP, o una clase de Get Ready de 2 horas, es un gran comienzo. Basta con una persona en su casa. En el Condado de Alameda, Oakland, Berkeley, Fremont y Hayward tienen sus propias clases, así que pregunte en el departamento de bomberos de su ciudad.",
  },
  block: {
    name: "Conozca a tres vecinos y acuerden quién recorre la cuadra",
    why: "Conozca a tres vecinos de su piso o de su cuadra, y acuerden que uno de ustedes recorrerá la cuadra después de un terremoto para ver quién necesita ayuda.",
    tip: "Enséñeles el letrero de OK / AYUDA para que todos sepan buscarlo. Cuando esté listo, una reunión corta de la cuadra ayuda más: escojan un lugar para reunirse y apunten quién tiene habilidades o herramientas útiles, como primeros auxilios o una escalera. Que cada quien comparta solo lo que quiera. La hoja de cálculo tiene una pestaña de Vecinos para apuntes.",
  },
  "offer-ride": {
    name: "Ofrézcale a un vecino llevarlo si hay que salir",
    why: "En los incendios rápidos, las personas sin carro muchas veces son las últimas en salir. Dígale a un vecino que le puede mandar un mensaje para que usted lo lleve.",
    tip: "Acuerden cómo se van a comunicar si los teléfonos no funcionan. Tocar la puerta funciona.",
  },

  // ----- Caja para quedarse en casa ----------------------------------------------
  bin: {
    name: "Caja grande de plástico con tapa",
    why: "Mantiene todo junto y seco, en un solo lugar que puede encontrar a oscuras.",
    tip: "Si pesa mucho, las ruedas ayudan. El agua puede ir al lado.",
  },
  water: {
    name: "Agua para tomar",
    why: "Calcule por lo menos 1 galón por persona al día, para tomar y para limpiarse lo básico. EBMUD les pide 2 a las casas del Este de la Bahía. Después de un terremoto fuerte, el agua de la llave puede faltar o no ser segura por días o semanas.",
    tip: "Los niños, las mamás que dan pecho, las embarazadas, los enfermos y cualquier persona en una ola de calor necesitan más. Guárdela en un lugar fresco y oscuro, lejos de químicos. Cambie el agua comprada para la fecha que dice, y el agua de la llave que usted embotelló cada 6 meses. El agua para las mascotas ya está contada.",
  },
  bleach: {
    name: "Cloro sin olor",
    why: "Para hacer segura el agua que no sabe si se puede tomar. La dosis de EBMUD: 8 gotas de cloro al 6% (o 6 gotas al 8.25%) por galón de agua clara, y luego espere 30 minutos. Hervirla por 1 minuto también funciona.",
    tip: "Si el agua está turbia, déjela asentar y pásela por un trapo limpio primero, y luego use el doble de cloro. Use cloro normal, sin olor y que no sea \"splash-less\" (antisalpicaduras), y cámbielo cada año.",
  },
  "water-storage": {
    name: "Recipientes grandes de agua o un tambo",
    why: "Recipientes aptos para alimentos que usted llena con agua de la llave. Es lo más barato por galón para apagones largos. El agua de la llave no necesita tratamiento si la cambia cada 6 meses.",
    tip: "Un tambo de 55 galones lleno pesa unas 460 libras. Póngalo en la planta baja y consiga una bomba de sifón.",
    examples: ["WaterBrick (se pueden apilar)", "Reliance Jumbo-Tainer", "Bidones de agua Scepter"],
  },
  "water-filter": {
    name: "Filtro de agua",
    why: "Le permite tomar agua de un arroyo, un barril de lluvia u otra fuente afuera si se le acaba el agua guardada.",
    tip: "Busque uno clasificado para bacterias y protozoos. Los filtros no eliminan los virus, así que después de filtrar agregue cloro o una pastilla, o hierva el agua. Tampoco quitan los químicos, así que no tome agua de alberca ni de inundación aunque la filtre.",
  },
  dropper: {
    name: "Gotero",
    why: "Para medir las gotas de cloro en el agua. Póngale una etiqueta para que nadie lo use después para medicinas.",
  },
  food: {
    name: "Proteína en lata: frijoles, atún, pollo o chili",
    why: "La base de su plan de comida: más o menos una lata por persona al día. Con las otras comidas de la lista alcanza para aguantar, no para comidas completas. No le reduzca la comida a los niños, ni a quien esté embarazada o dando pecho.",
    tip: "Escoja comida que llene: frijoles, chili o pollo mejor que atún, fruta en su jugo, y entera en vez de baja en grasa. ¿Lleva una dieta baja en sal o con líquidos limitados? Escoja latas bajas en sodio y pregúntele a su doctor cuánto tomar en una ola de calor. Compre lo que ya come, para que la pueda ir usando en sus comidas. Las latas con abre fácil le ahorran el abrelatas.",
  },
  "food-fruit-veg": {
    name: "Fruta y verdura en lata",
    why: "Más o menos una lata por persona al día, para vitaminas y fibra. El jugo cuenta como parte de lo que toma.",
  },
  "food-grains": {
    name: "Galletas saladas, cereal o granola",
    why: "Unas dos porciones por persona al día. Una caja trae como ocho.",
    tip: "Escoja cajas o paquetes cerrados. Se ponen viejos rápido una vez abiertos.",
  },
  "food-nut-butter": {
    name: "Crema de cacahuate u otra crema de nueces",
    why: "Una o dos cucharadas por persona al día. Muchas calorías y proteína, y no hay que cocinarla. Un frasco trae unas 14 porciones.",
    tip: "La crema de semillas de girasol sirve para quienes tienen alergia a las nueces.",
  },
  "food-snacks": {
    name: "Barras de granola, mezcla de nueces o fruta seca",
    why: "Una al día por persona, para tener energía entre comidas. Un antojito conocido ayuda mucho en momentos de estrés, sobre todo a los niños.",
  },
  "special-diet": {
    name: "Comida segura para alergias o dietas especiales",
    why: "Puede que los refugios y los lugares donde reparten comida no tengan opciones seguras para usted. Empaque suficiente para todo el tiempo.",
  },
  "can-opener": {
    name: "Abrelatas manual",
    why: "Los abrelatas eléctricos no funcionan sin luz.",
  },
  dishes: {
    name: "Platos y tazones de papel",
    why: "Ahorran el agua que usaría para lavar los trastes.",
  },
  cups: {
    name: "Vasos de papel",
    why: "Ahorran el agua que usaría para lavar los trastes.",
  },
  utensils: {
    name: "Cubiertos de plástico",
    why: "Ahorran el agua que usaría para lavar los trastes.",
  },
  stove: {
    name: "Estufa de campamento",
    why: "Para comida caliente y para hervir agua durante apagones largos.",
    tip: "Úsela solo afuera. Nunca use una estufa de campamento, un asador o un generador adentro, ni siquiera en la cochera. Después de un terremoto, revise que no haya fugas de gas antes de prender cualquier cosa. Si alguien usa oxígeno, cocine bien lejos de esa persona y de los tanques.",
  },
  "stove-fuel": {
    name: "Combustible para la estufa de campamento",
    why: "Suficiente para una comida caliente al día. Revise qué tipo de cartucho o combustible usa su estufa.",
  },
  lighter: {
    name: "Encendedor o cerillos a prueba de agua",
    why: "Para prender la estufa de campamento o un asador afuera.",
    tip: "Si alguien en su casa usa oxígeno, mantenga los encendedores y cerillos lejos de esa persona y de los tanques.",
  },
  cooler: {
    name: "Hielera",
    why: "Salva la comida del refrigerador durante un apagón largo: pase a la hielera lo más importante. También sirve para medicinas que tienen que estar frías.",
    tip: "Mantenga el refrigerador cerrado. La comida en un refrigerador cerrado se mantiene segura unas 4 horas, y en un congelador lleno unas 48.",
  },
  "ice-packs": {
    name: "Bolsas de hielo reutilizables",
    why: "Tenga algunas en el congelador para que estén listas para la hielera cuando se vaya la luz.",
  },
  "cold-med-pouch": {
    name: "Estuche térmico y bolsas frías para medicinas",
    why: "Para medicinas que tienen que estar frías, como la insulina, si sale de su casa.",
    tip: "La mayoría de la insulina aguanta hasta 28 días entre 59 y 86°F, así que revise la etiqueta. Nunca deje que toque una bolsa de hielo: envuélvala en un trapo para que no se congele. No la deje en un carro caliente ni al sol.",
  },
  "diabetes-go": {
    name: "Si usa insulina: tabletas de glucosa y artículos de respaldo",
    why: "En una emergencia las comidas se vuelven irregulares, y eso hace más probable que le baje el azúcar, y las bajas se vuelven peligrosas rápido. Empaque tabletas o gel de glucosa, glucagón si se lo recetaron, y un recipiente para agujas (sirve una botella vacía de detergente).",
    tip: "¿Usa bomba de insulina? Empaque plumas o jeringas e insulina de acción prolongada por si falla la bomba, y cambie la insulina de la bomba por lo menos cada 48 horas. Si nadie usa insulina, omita esto.",
  },
  "device-go": {
    name: "Su aparato médico, su cargador y sus cables",
    why: "Si tiene que salir, lleve el aparato, su cargador, un cable de corriente directa (DC) o para el carro, y una extensión. Los refugios tienen enchufes, pero no siempre hay uno libre cerca.",
    tip: "Agréguelo a su lista de lo que hay que llevar para que no se quede. Oxígeno portátil: lleve el aparato portátil y sus baterías, o los tanques.",
  },
  flashlights: {
    name: "Linterna o linterna de cabeza",
    why: "Una por persona. Las linternas de cabeza le dejan las manos libres.",
    tip: "No use velas. Son una causa común de incendios después de los terremotos.",
  },
  lantern: {
    name: "Lámpara de baterías",
    why: "Ilumina todo el cuarto para que no estén batallando con linternas a la hora de la cena.",
  },
  batteries: {
    name: "Baterías de repuesto",
    why: "Suficientes para cambiar por lo menos una vez todas las baterías de sus linternas y su radio.",
    tip: "Revise los tamaños antes de comprar. Guárdelas fuera de los aparatos para que no se derramen.",
  },
  powerbank: {
    name: "Batería portátil para el celular",
    why: "Su celular es su linterna, su radio y su forma de pedir ayuda. Una batería portátil cargada lo mantiene funcionando unos días.",
    tip: "Una de 10,000 mAh carga la mayoría de los celulares dos o tres veces. Recárguela cada pocos meses.",
    examples: ["Batería portátil solar BLAVOR"],
  },
  cable: {
    name: "Cable para cargar el celular",
    why: "Es fácil olvidarlo cuando sale con prisa, y no todos los celulares usan el mismo enchufe.",
  },
  "power-station": {
    name: "Estación de energía portátil",
    why: "Una batería grande y recargable que puede hacer funcionar un CPAP, un ventilador o un refrigerador pequeño por horas. Es silenciosa y segura adentro, a diferencia de un generador. No hace funcionar por mucho tiempo un concentrador de oxígeno de casa.",
    tip: "Si es para un aparato médico, revise cuántos watts usa el aparato y pregúntele a su proveedor cuánto tiempo lo aguanta una batería. Con una regleta también puede cargar los celulares de los vecinos.",
  },
  solar: {
    name: "Panel solar pequeño",
    why: "Recarga las baterías portátiles o una estación de energía cuando el apagón dura más de unos días.",
  },
  radio: {
    name: "Radio de baterías o de manivela",
    why: "Si las redes de celular no funcionan, la radio local es como las autoridades dan las noticias. KCBS 740 AM y KQED 88.5 FM cubren el Área de la Bahía, y la radio del clima de NOAA está en 162.400 MHz.",
    tip: "Busque una con las bandas del clima de NOAA y un puerto USB para cargar el celular.",
    examples: ["Radio de manivela Midland ER210"],
  },
  "contacts-paper": {
    name: "Números de teléfono importantes en papel",
    why: "Si se le acaba la batería al celular, ¿se sabe el número de alguien? Incluya su contacto fuera del área, sus doctores y su seguro, más la Línea de Ayuda para los Afectados por Catástrofes (llame o mande texto al 1-800-985-5990, oprima 2 para español) y el 988 para una crisis de salud mental.",
    tip: "Las tarjetas para la cartera de su PDF sirven muy bien para esto. Los niños también llevan una, con sus números, en la mochila o el bolsillo. Ayúdelos a aprenderse un número de memoria.",
  },
  "first-aid": {
    name: "Botiquín de primeros auxilios",
    why: "Las cortadas, raspones y torceduras son las heridas más comunes después de un terremoto. La ayuda puede tardar en llegar.",
    tip: "Asegúrese de que tenga curitas, gasa, cinta, guantes de nitrilo, pinzas y una botella para exprimir o una jeringa para lavar las heridas con agua limpia, que es el primer paso para cualquier cortada. Un botiquín pequeño está bien para la mochila de emergencia. Una guía impresa o la aplicación de Primeros Auxilios de la Cruz Roja funcionan sin internet.",
  },
  otc: {
    name: "Medicinas de uso diario",
    why: "Medicina para el dolor, para la alergia, para la diarrea, y un termómetro. Las farmacias pueden estar cerradas.",
  },
  rx: {
    name: "Medicinas recetadas y artículos médicos de más",
    why: "Las farmacias pueden estar cerradas o sin surtido. Los CDC recomiendan por lo menos una semana de medicinas en su mochila de emergencia y dos semanas en casa si puede.",
    tip: "Incluya artículos como tiras reactivas, agujas o bolsas de ostomía. Para conseguir más, pida en la farmacia un \"vacation override\" (permiso para surtir antes por viaje) o pídale a su doctor una receta para 90 días. Cuando se declara un desastre, los planes de medicinas de Medicare quitan el límite de \"demasiado pronto para surtir\", y los farmacéuticos de California pueden dar surtidos de emergencia. Para medicinas controladas, como la metadona o la buprenorfina, pregunte en su clínica por su plan de emergencia. Si usted no toma ninguna, marque su nombre.",
  },
  "med-info": {
    name: "Información médica por escrito",
    why: "Una hoja por persona: condiciones, medicinas y dosis, alergias, modelos de equipo, doctores, farmacia y un contacto de emergencia. Ayuda a los equipos de rescate y a los refugios si alguien no puede explicar, y mantiene los datos de cada quien en su propia mochila.",
    tip: "Una hoja de medicinas ayuda: cómo se ve cada pastilla, para qué es y la dosis. Escriba el nombre de dos personas que vendrían a ver cómo está y que saben usar su equipo.",
  },
  glasses: {
    name: "Lentes, lentes de contacto o baterías para aparatos auditivos de repuesto",
    why: "Los lentes se rompen o se pierden en los terremotos. Unos lentes viejos son mejor que nada.",
    tip: "Papel y pluma ayudan si necesita escribir las cosas o si no oye bien en un refugio con mucho ruido.",
  },
  "device-power": {
    name: "Batería de respaldo para su aparato médico",
    why: "Los cortes de luz planeados pueden durar dos o tres días o más, y los apagones por terremoto más tiempo. Averigüe cuántos watts usa su aparato y cuánto tiempo lo aguanta una batería, y planee para por lo menos 72 horas.",
    tip: "Pregúntele a su proveedor qué batería le queda. CPAP: apague el humidificador y la manguera con calefacción para que la batería dure varias veces más, y consiga el cable DC del fabricante. Un cable DC para el carro puede hacer funcionar algunos aparatos con el carro, pero solo con el carro completamente afuera, nunca en la cochera, aunque la puerta esté abierta, y nunca mientras alguien duerme adentro.",
  },
  "oxygen-backup": {
    name: "Oxígeno de respaldo para los apagones",
    why: "Una batería no puede hacer funcionar por días un concentrador de oxígeno de casa. Usan demasiada electricidad. Tenga suficientes cilindros de respaldo para por lo menos 72 horas, y guarde con ellos el número de emergencia de su proveedor.",
    tip: "Sepa adónde iría si el apagón se alarga: un Centro de Recursos Comunitarios de PG&E, la casa de un amigo fuera del apagón o un refugio con luz. Vaya a la sala de emergencias si le cuesta respirar, no para cargar su aparato.",
  },
  "mobility-kit": {
    name: "Repuestos para aparatos de movilidad",
    why: "Un kit para parchar llantas, un bastón de repuesto, una batería de repuesto cargada para la silla de ruedas eléctrica o el scooter, o una silla manual de respaldo. Los elevadores pueden no funcionar por días.",
    tip: "Los precios varían mucho. Un kit de parches cuesta unos pocos dólares, pero una batería de repuesto para la silla eléctrica o una silla de respaldo puede costar cientos. Pregúntele a su proveedor y a su seguro qué cubren.",
  },
  "hygiene-stay": {
    name: "Papel de baño",
    why: "Se puede acabar en las tiendas, y va a usar más de lo que cree.",
  },
  soap: {
    name: "Jabón para las manos",
    why: "El gel antibacterial no funciona bien con las manos sucias. Un poco de agua y jabón, sí.",
  },
  sanitizer: {
    name: "Gel antibacterial",
    why: "Tener las manos limpias evita enfermedades cuando no hay agua de la llave.",
    tip: "Busque uno con por lo menos 60% de alcohol.",
  },
  wipes: {
    name: "Toallitas húmedas",
    why: "Para limpiarse cuando no hay agua de sobra.",
  },
  menstrual: {
    name: "Productos para la menstruación",
    why: "Lo de un ciclo o más para quien los use. Es fácil olvidarlos y difícil encontrarlos después de un desastre.",
    tip: "Si nadie en la casa los necesita, omita esto.",
  },
  toilet: {
    name: "Cubeta con tapa, para un baño de emergencia",
    why: "No le jale al escusado después de un terremoto fuerte hasta saber que el drenaje está bien. Sirve una cubeta de 5 galones forrada con bolsas gruesas, más arena para gatos o aserrín.",
    tip: "Los asientos de escusado para cubeta son baratos. Una segunda cubeta para separar la orina del excremento baja mucho el olor. Amarre las bolsas llenas y guárdelas en un bote de basura con tapa, lejos de donde vive la gente, hasta que las autoridades digan cómo deshacerse de ellas. Ponga al lado un lugar para lavarse las manos: un garrafón de agua, jabón y un tazón o cubeta para recibir el agua.",
  },
  "toilet-bags": {
    name: "Bolsas de basura gruesas",
    why: "Para forrar la cubeta del baño: más o menos una al día por persona. Compre más para la basura, porque puede que dejen de recogerla.",
    examples: ["Bolsas para desechos Double Doodie con gel"],
  },
  "toilet-litter": {
    name: "Arena para gatos o aserrín",
    why: "Una palada después de cada uso de la cubeta baja el olor.",
  },
  gloves: {
    name: "Guantes de trabajo gruesos",
    why: "Para quitar vidrios rotos y escombros sin cortarse las manos.",
  },
  "duct-tape": {
    name: "Cinta adhesiva gruesa (duct tape)",
    why: "Para tapar ventanas rotas con plástico, arreglar cosas y sellar rendijas contra el humo.",
  },
  tarp: {
    name: "Lona o tienda de campaña",
    why: "Si no es seguro dormir en su casa después de un terremoto, tal vez quiera acampar en el patio o cerca.",
  },
  blankets: {
    name: "Cobijas o bolsas de dormir",
    why: "Sin calefacción, las noches en el Área de la Bahía se ponen frías rápido.",
  },
  crowbar: {
    name: "Barreta o pata de cabra",
    why: "Los terremotos atoran las puertas. Una barreta puede sacarlo a usted, o a un vecino.",
  },
  n95: {
    name: "Mascarillas N95",
    why: "Filtran las partículas finas del humo de los incendios, y el polvo después de un terremoto. Las mascarillas de tela y las quirúrgicas no.",
    tip: "Busque \"NIOSH approved\" (aprobada por NIOSH) en la caja. Tienen que quedar bien ajustadas, así que escoja una talla para cada adulto y adolescente. Las N95 no están hechas para niños, así que manténgalos adentro con aire limpio. Es fácil compartir las que sobren con los vecinos en días de humo.",
  },
  "box-fan-filter": {
    name: "Ventilador de caja con un filtro pegado",
    why: "Un purificador de aire barato y comprobado para su cuarto de aire limpio: un ventilador de caja con un filtro de calefacción pegado atrás con cinta. Busque MERV 13 en el paquete.",
    tip: "Use un ventilador de caja hecho en 2012 o después, con la marca UL o ETL. Los ventiladores más viejos se pueden sobrecalentar, así que no los deje prendidos toda la noche ni sin nadie cerca. Siga la flecha de la dirección del aire que viene en el filtro, y no use extensiones. Cuatro filtros pegados en forma de cubo (una caja Corsi-Rosenthal) funcionan todavía mejor. Cambie el filtro cuando se ponga gris oscuro.",
  },
  "air-purifier": {
    name: "Purificador de aire HEPA",
    why: "Una opción más silenciosa y cerrada para las recámaras. Escójalo del tamaño del cuarto.",
    tip: "Evite los purificadores que producen ozono.",
  },
  cooling: {
    name: "Ventilador de baterías o USB",
    why: "El aire en movimiento le ayuda a refrescarse cuando no hay aire acondicionado ni luz.",
    tip: "Si adentro hace más de unos 90°F, un ventilador solo puede empeorar las cosas: mantenga la piel mojada mientras está prendido, o vaya a un lugar con aire acondicionado. Una bebida con electrolitos repone la sal que pierde al sudar en un calor largo.",
  },
  "cooling-towels": {
    name: "Toallas para refrescarse",
    why: "Mójelas y póngaselas en el cuello. La piel mojada más el aire en movimiento lo refrescan, siempre que el cuarto no esté a mucho más de unos 90°F.",
  },
  "cash-stay": {
    name: "Efectivo en billetes chicos",
    why: "Las terminales para tarjetas y los cajeros no funcionan sin luz o sin internet.",
    tip: "Tenga billetes de uno y de cinco. Puede que las tiendas no tengan cambio.",
  },
  helmet: {
    name: "Casco",
    why: "Le protege la cabeza de lo que se caiga durante las réplicas y la limpieza. Un casco de bicicleta sirve.",
  },
  "plastic-sheeting": {
    name: "Plástico grueso, cortado a la medida de un cuarto",
    why: "Sella ventanas y rejillas para que no entre el aire de afuera durante una fuga química. También sirve para tapar ventanas rotas después de un terremoto.",
    tip: "Corte con tiempo y marque las piezas para cada ventana y rejilla. Tenga toallas húmedas listas para las rendijas de las puertas.",
  },
  "bleed-kit": {
    name: "Kit para controlar sangrados",
    why: "Un sangrado grave por vidrios y escombros puede matar en minutos. Un torniquete y un vendaje de presión ayudan mientras llega la ayuda.",
    tip: "Una clase gratis de Stop the Bleed le enseña a usarlo.",
  },
  "phone-setup": {
    name: "Prepare su celular para emergencias",
    why: "Active las alertas de emergencia en Configuración, agregue contactos de Emergencia SOS y una Ficha Médica, descargue un mapa sin conexión del Área de la Bahía, e instale MyShake para los avisos de terremoto.",
    tip: "Cada cosa toma un par de minutos. Los celulares Android ya traen alertas de terremoto, pero MyShake es un buen respaldo. Sin señal, los iPhone más nuevos y algunos Android pueden mandar texto al 911 por satélite, y los iPhone también a sus contactos. Solo funciona afuera, con vista despejada al cielo. Pruebe la demostración en Configuración.",
  },
  effak: {
    name: "Llene el kit de primeros auxilios financieros de FEMA",
    why: "Una lista para juntar desde ahora números de cuenta, pólizas y papeles importantes, para no andar buscándolos después de un desastre.",
    tip: "Guarde con ella copias de su contrato de renta o escritura y de sus pólizas de seguro, en una bolsa resistente al fuego si puede. Imprima también los códigos de respaldo de su correo y de su administrador de contraseñas. Si pierde el celular, puede quedarse sin acceso a todo.",
  },
  "calm-kit": {
    name: "Algo que le dé consuelo",
    why: "Lo que le ayude en un día muy difícil: un juguete para las manos, un olor favorito, una foto o una lista de ejercicios de respiración. Para los niños, un juguete o libro favorito.",
    tip: "El estrés hace difícil pensar. Las cosas que ya escogió con tiempo ayudan más de lo que cree.",
  },
  earplugs: {
    name: "Tapones para los oídos",
    why: "Para dormir en un refugio o en la sala de un amigo. También ayudan cuando hay demasiado ruido y estímulos.",
  },
  "eye-mask": {
    name: "Antifaz para dormir",
    why: "En los refugios dejan las luces prendidas en la noche.",
  },
  cards: {
    name: "Libreta y pluma",
    why: "Para listas, apuntes y dejar recados, como adónde se fue.",
  },
  "deck-of-cards": {
    name: "Baraja",
    why: "Una forma fácil de pasar el tiempo y convivir con la gente a su alrededor.",
  },
  activities: {
    name: "Juegos, libros y rompecabezas",
    why: "Dos semanas sin internet es mucho tiempo. Las cosas para compartir también unen a los vecinos, y eso importa mucho después de un desastre.",
  },
  splint: {
    name: "Férula",
    why: "Para una torcedura o fractura mientras consigue ayuda, que puede tardar después de un terremoto fuerte.",
    tip: "Aprenda a usarla antes de necesitarla.",
    examples: ["Férula SAM"],
  },
  "liquid-bandage": {
    name: "Curita líquida",
    why: "Sella cortadas pequeñas en las manos y los dedos donde no se queda una curita.",
    tip: "No la guarde en un carro caliente.",
  },

  // ----- Bebés y niños -----------------------------------------------------------
  formula: {
    name: "Fórmula",
    why: "Suficiente para todo el tiempo. Los CDC dicen que la fórmula lista para tomar es la más segura en emergencias, porque la fórmula en polvo necesita agua limpia.",
    tip: "Si da pecho, siga dándolo: es la comida más segura en una emergencia. Si se saca leche, empaque un extractor manual. Agregue la cartilla de vacunas a la mochila de emergencia.",
  },
  "baby-food": {
    name: "Comida para bebé",
    why: "Las bolsitas son fáciles de empacar y no necesitan cuchara ni refrigerador.",
  },
  feeding: {
    name: "Biberones o vasos desechables para dar de comer",
    why: "Los vasos desechables son más fáciles de mantener limpios que los biberones cuando falta agua.",
  },
  diapers: {
    name: "Pañales",
    why: "Calcule unos 8 al día por bebé.",
  },
  "baby-wipes": {
    name: "Toallitas para bebé",
    why: "Para cambiar pañales y limpiarse cuando falta agua. Más o menos un paquete cada pocos días.",
  },
  carrier: {
    name: "Portabebés o rebozo",
    why: "Le deja las manos libres y sirve donde no puede pasar una carriola.",
  },
  "kid-meds": {
    name: "Medicina para la fiebre y el dolor para niños",
    why: "En la dosis correcta para su edad y su peso.",
  },
  comfort: {
    name: "Cosas que los consuelen y algo que hacer",
    why: "Un juguete favorito, un libro, cartas o crayolas. Las cosas conocidas ayudan a los niños a sobrellevar el estrés.",
  },

  // ----- Mascotas ----------------------------------------------------------------
  "pet-food": {
    name: "Comida para mascotas",
    why: "Se puede acabar en los refugios y las tiendas. El agua para las mascotas ya está contada en su agua.",
    tip: "Vaya usando y reponiendo la comida de sus mascotas igual que la suya. Las croquetas se ponen viejas una vez abierta la bolsa.",
  },
  "pet-carry": {
    name: "Correa y arnés, o una transportadora",
    why: "Los refugios que aceptan mascotas piden que estén con correa o en una transportadora.",
    tip: "Empaque también una correa de repuesto y bolsas para el popó.",
  },
  "pet-bowl": {
    name: "Plato plegable para el agua",
    why: "Se dobla y cabe plano en la mochila de emergencia, para que las mascotas tomen agua en el camino.",
  },
  "pet-records": {
    name: "Medicinas de la mascota, cartilla de vacunas y una foto reciente",
    why: "Las pensiones y los refugios piden la cartilla de vacunas. Una foto ayuda si se separan.",
  },
  litter: {
    name: "Arena para gatos",
    why: "Suficiente para todo el tiempo. Puede que no recojan la basura y que las tiendas no tengan.",
  },
  "litter-box": {
    name: "Arenero desechable",
    why: "Para un refugio o la casa de un amigo. Una charola de aluminio para hornear también sirve.",
  },

  // ----- Mochila de emergencia ---------------------------------------------------
  backpack: {
    name: "Mochila",
    why: "Una por cada persona que pueda cargar una. Una mochila le deja las manos libres.",
    tip: "Una de unos 30 litros cabe todo y todavía se carga cómodo. Las tiendas de equipo de campismo usado son una opción barata. Si le cuesta cargar, también sirve una maleta chica con ruedas o una bolsa que se cuelga de la silla de ruedas o la andadera.",
    examples: ["Geartrade (equipo de campismo usado)", "REI Re/Supply (usado)"],
  },
  "water-go": {
    name: "Botella de agua",
    why: "Por lo menos un litro por persona. Tres días de agua pesan unas 25 libras por persona, así que cargue lo que pueda cómodamente y deje el resto en el carro si tiene.",
    tip: "Los sobres de electrolitos y de café instantáneo casi no pesan y ayudan mucho.",
  },
  "purify-go": {
    name: "Pastillas para purificar el agua",
    why: "Son ligeras y hacen segura el agua que no sabe si se puede tomar cuando se le acaben las botellas. Espere el tiempo que dice el paquete antes de tomarla.",
    tip: "Una botella con filtro es un buen extra para el agua turbia, pero los filtros no eliminan los virus, así que use una pastilla después de filtrar.",
    examples: ["Pastillas Aquatabs", "Filtro personal LifeStraw"],
  },
  "food-go": {
    name: "Comida lista para comer",
    why: "Comida ligera, con muchas calorías, que no se aplaste: barras de proteína, sobres de crema de cacahuate, carne seca. La fruta seca ayuda si le baja el azúcar, y un antojito sube el ánimo.",
    tip: "Pruebe las barras primero y compre las que le gusten. Para el kit del carro, escoja barras de ración hechas para aguantar el calor.",
    examples: ["Barras de ración de emergencia SOS"],
  },
  "headlamp-go": {
    name: "Linterna de cabeza",
    why: "Luz con las manos libres para salir caminando de noche.",
  },
  whistle: {
    name: "Silbato",
    why: "Se oye mucho más lejos que su voz y cansa menos si necesita ayuda.",
  },
  "cash-go": {
    name: "Efectivo en billetes chicos",
    why: "Para gasolina, comida o un motel si las tarjetas no funcionan. Cada persona lleva el suyo.",
    tip: "Billetes chicos. Los niños también llevan un poco, por si se separan.",
  },
  "docs-copies": {
    name: "Copias de identificaciones y seguros en una bolsa con cierre",
    why: "Comprobar quién es y dónde vive le ayuda a regresar a zonas evacuadas y a recibir ayuda. Cada persona lleva las suyas.",
    tip: "Su identificación, la tarjeta del seguro médico, la póliza de la casa o de inquilino, llaves de repuesto de la casa y el carro, y una foto impresa de su familia y sus mascotas por si se separan. Niños: una copia de su acta de nacimiento. Mascotas: los números de microchip. ¿No tiene identificación? Aun así puede recibir ayuda: los refugios de la Cruz Roja no piden identificación ni estatus migratorio para quedarse.",
  },
  "clothes-go": {
    name: "Una muda de ropa y zapatos resistentes",
    why: "Las mangas largas, los pantalones largos y los zapatos cerrados lo protegen de los escombros, el humo y el frío.",
    tip: "El algodón y la lana son más seguros que las telas sintéticas cerca del fuego. Agregue un gorro para el frío, una chamarra para la lluvia en invierno y un sombrero para el sol en verano.",
  },
  "hygiene-go": {
    name: "Kit pequeño de higiene",
    why: "Cepillo de dientes, pasta de dientes, toallitas, gel antibacterial, pañuelos desechables, bloqueador solar, bálsamo para labios y productos para la menstruación para un ciclo si los necesita.",
    tip: "Una bolsa con cierre que no se transparente (o forrada con duct tape) sirve para los desechos personales. Empaque lentes de contacto y su solución si los usa.",
  },
  map: {
    name: "Mapa de papel de su área",
    why: "Los mapas del celular pueden no cargar. Marque dos salidas de su vecindario.",
  },
  multitool: {
    name: "Multiherramienta",
    why: "Navaja, pinzas y desarmador en una sola.",
    examples: ["Multiherramienta 14 en 1"],
  },
  cord: {
    name: "Cuerda paracord",
    why: "Sirve para amarrar una lona, colgar una luz o cambiar una correa rota.",
  },
  "zip-bags": {
    name: "Bolsas de plástico con cierre",
    why: "Mantienen secos los celulares, papeles y medicinas.",
  },
  goggles: {
    name: "Lentes protectores (goggles)",
    why: "Evitan que le entre ceniza, humo y polvo a los ojos.",
  },
  "radio-go": {
    name: "Radio de manivela pequeño",
    why: "Para tener noticias en el camino cuando el celular tiene poca batería.",
  },
  bivvy: {
    name: "Manta de emergencia o bolsa de dormir",
    why: "Una manta de aluminio se dobla al tamaño de un bolsillo. Una bolsa de dormir de emergencia es un poco más grande y mucho más calientita.",
  },

  // ----- Kit para el carro -------------------------------------------------------
  "car-water": {
    name: "Agua para el carro",
    why: "Por si se queda atorado en el tráfico durante una evacuación, o después de que un terremoto cierre las calles.",
    tip: "CAL FIRE sugiere 3 galones por persona para evacuar. Cambie el agua del carro cada 6 meses.",
  },
  "car-snacks": {
    name: "Botanas para el carro",
    why: "Suficientes para que todos aguanten si se quedan atorados por horas.",
    tip: "Escoja cosas que aguanten el calor, como barras de ración o galletas saladas. El chocolate se derrite.",
  },
  "car-basics": {
    name: "Linterna para el carro",
    why: "Para una noche en el carro o una parada a oscuras en la orilla del camino.",
    tip: "Agregue un chaleco reflejante. El calor echa a perder el chocolate, algunas medicinas y la curita líquida, así que no los deje en el carro.",
  },
  "car-blanket": {
    name: "Cobija para el carro",
    why: "Los carros se enfrían rápido de noche con el motor apagado.",
  },
  "car-charger": {
    name: "Cargador de celular para el carro",
    why: "Mantiene los celulares cargados mientras sale manejando.",
  },
  "car-first-aid": {
    name: "Botiquín pequeño de primeros auxilios",
    why: "Para cuando está lejos del botiquín de su casa.",
  },
  "car-shoes": {
    name: "Zapatos para caminar",
    why: "Si hay un terremoto mientras va o viene del trabajo, tal vez tenga que caminar a su casa.",
  },
  "car-jumper": {
    name: "Cables para pasar corriente",
    why: "Para arrancar otra vez si se le descarga la batería mientras está atorado.",
  },
  "road-flares": {
    name: "Triángulos reflejantes",
    why: "Hacen que lo vean si está parado en la orilla del camino.",
    tip: "No use bengalas de carretera. Pueden prender el pasto seco.",
  },
  "car-n95": {
    name: "Mascarillas N95",
    why: "Para manejar entre el humo. Ponga también la ventilación en recirculación.",
    tip: "Una para cada adulto y adolescente. Las N95 no están hechas para niños.",
  },
};
