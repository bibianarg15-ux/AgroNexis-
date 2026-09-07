export function obtenerRangoSemana(timestamp:number) : { inicio:number; fin:number }{
   const fecha = new Date(timestamp)
   const diaSemana = fecha.getDay();

   const diasHastaLunes =diaSemana === 0 ? 6 : diaSemana -1;

   const lunes = new Date(fecha);
   lunes.setDate(fecha.getDate() - diasHastaLunes);
   lunes.setHours(0,0,0,0);

   const domingo = new Date(lunes);
   domingo.setDate(lunes.getDate() + 6 );
   domingo.setHours(23,59,59,999);
   return {inicio: lunes.getTime(), fin: domingo.getTime()};
   }
 export function formatearRangoSemana(inicio:number, fin:number): string {
   const opciones: Intl.DateTimeFormatOptions = {day:'numeric'}
   const opcionesConMes: Intl.DateTimeFormatOptions ={ day:'numeric', month:'long'}

   const fechaInicio = new Date(inicio);
   const fechaFin= new Date(fin);


   const mismoMes = fechaInicio.getMonth() === fechaFin.getMonth();

   const textoInicio = fechaInicio.toLocaleDateString('es-CO', mismoMes ? opciones : opcionesConMes);
   const textoFin = fechaFin.toLocaleDateString('es-CO', opcionesConMes);

   return `${textoInicio} - ${textoFin}`
 }