import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Date } from '../interfaces/date.interface';
import { Agenda } from '../interfaces/agenda.interface';

@Injectable({
  providedIn: 'root'
})
export class DateServiceService {

  private readonly baseUrl: string = environment.baseUrl;
  private http = inject(HttpClient);

  constructor() { }

  getDates() {
    return this.http.get<Date[]>(this.baseUrl);
  }

  postDatesModified(agenda: Agenda) {

    // Dividir la cadena de hora en horas y minutos
    const [hour, minutes] = agenda.hour.split(':');

    // Convertir las horas y los minutos a números enteros
    const hourInt = parseInt(hour, 10);
    const minutesInt = parseInt(minutes, 10);

    // Agregar 30 minutos
    let newMinutes = minutesInt + 30;

    // Calcular el nuevo tiempo
    let newHour = hourInt;
    if (newMinutes >= 60) {
        newHour += 1;
        newMinutes -= 60;
    }

    // Formatear el nuevo tiempo como cadena
    const newTime = `${newHour}:${newMinutes < 10 ? '0' : ''}${newMinutes}`;

    // Actualizar el tiempo en la agenda
    newTime;

    return this.http.post<Agenda>(this.baseUrl, {name: agenda.name  , service:agenda.service, hour: newTime  });




  }

  postDates(agenda: Agenda) {


    return this.http.post<Agenda>(this.baseUrl, agenda);
  }


}
