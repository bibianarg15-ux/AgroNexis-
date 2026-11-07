const HORA_AVISO = 7;

function diaElegido(timestamp: number) {
    const f = new Date(timestamp);
    return {
        anio: f.getUTCFullYear(),
        mes: f.getUTCMonth(),
        dia: f.getUTCDate()
    }};

    //fecha del aviso de cosecha
    export function fechaAvisoCosecha(
        fechaCosecha: number,
        diasAnticipacion: number,
        ahora: Date = new Date()):
        Date | null {
            const {anio, mes, dia} = diaElegido(fechaCosecha);
            const aviso = new Date(anio, mes, dia - diasAnticipacion, HORA_AVISO, 0-0-0);
            return aviso > ahora ? aviso : null;
        }

        //Próximas fechas de aviso de una actividad que se repite.
        export function proximasOcurrencias(
            fechaBase: number,
            cadaDias: number,
            ahora: Date = new Date(),
            maximo = 8,
            horizonteDias = 60
        ): Date[] {
            if (cadaDias < 1) return [];

            const { anio, mes, dia } = diaElegido(fechaBase);
            const limite = new Date(ahora.getTime() + horizonteDias * 24 * 60 * 60 * 1000);
            const ocurrencias: Date[] = [];
            for (let k = 1; k <= 5000 && ocurrencias.length < maximo; k++) {
            const aviso = new Date(anio, mes, dia + k * cadaDias, HORA_AVISO, 0, 0, 0);
            if (aviso > limite) break;
            if (aviso > ahora) ocurrencias.push(aviso);
            }
            return ocurrencias
        }
    