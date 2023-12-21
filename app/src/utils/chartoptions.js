import 'chartjs-adapter-date-fns';
import { de } from 'date-fns/locale';


export const getOptions = (xAxisLabel) => {
    return {
        responsive: true,
        adapters: {
            date: {
                locale: de,
            }
        },
        scales: {
            x: {
                display: true,
                type: 'time',
                time: {
                    unit: 'hour',
                    tooltipFormat: 'dd.MM.yyyy HH:mm',
                    displayFormats: {
                        hour: 'HH:mm'
                    }

                },
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: xAxisLabel,
                },
            }
        }
    }
}