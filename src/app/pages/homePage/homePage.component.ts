import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DateServiceService } from '../../services/date-service.service';
import { Date } from '../../interfaces/date.interface';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService, ConfirmEventType } from 'primeng/api';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';




interface barber {
  turn?: Date;
  hour: string;
}

interface hour {
  hour: string;

}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    TableModule,
    CardModule,
    ButtonModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,

  ],
  providers:[ConfirmationService, MessageService],
  templateUrl: './homePage.component.html',
  styleUrl: './homePage.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {

  private dateService = inject(DateServiceService);
  private fb = inject(FormBuilder);

  public myForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    service: ['', Validators.required] ,
    hour: ['', Validators.required],
  })

  visible: boolean = false;



  hours = signal<hour[]>([]) ;

  services = [ {service: 'corte de pelo' },{service: 'Barba' }, {service: 'corte de pelo y barba' } ]



  turns  = signal<barber[]>([ { hour:'8:00'},{ hour:'8:30'}, { hour:'9:00'}, { hour:'9:30'}, { hour:'10:00'}, { hour:'10:30'}, { hour:'11:00'},{ hour:'11:30'},
  { hour:'12:00'},{ hour:'12:30'}, { hour:'13:00'}, { hour:'13:30'},{ hour:'14:00'},{ hour:'14:30'},
  { hour:'15:00'},{ hour:'15:30'}, { hour:'16:00'},{ hour:'16:30'}, { hour:'17:00'}, { hour:'17:30'},{ hour:'18:00'},{ hour:'18:30'}, { hour:'19:00'},{ hour:'19:30'},
   { hour:'20:00'}, { hour:'20:30'},]) ;





    constructor(private confirmationService: ConfirmationService, private messageService: MessageService) {}

    confirm1(event: Event) {
      this.confirmationService.confirm({
          target: event.target as EventTarget,
          message: 'seguro que desea agendar?',
          header: 'Confirmacion',
          icon: 'pi pi-exclamation-triangle',
          acceptIcon:"none",
          acceptLabel:"Si",
          rejectIcon:"none",
          rejectButtonStyleClass:"p-button-text",
          accept: () => {
              this.messageService.add({ severity: 'info', summary: 'Confirmado', detail: 'Has sido agendado' });
              this.agendar();
              this.visible = false;
              this.myForm.reset();
          },
          reject: () => {
              this.messageService.add({ severity: 'error', summary: 'Rechazado', detail: 'Tu turno no se agendo', life: 3000 });
              this.visible = false;
              this.myForm.reset();
          }
      });
  }

    ngOnInit() {
      this.onServiceChange();

      this.matchDates();

    }

    public dateEffect = effect( () => {
      this.matchDates();

    } )

    matchDates(){

      this.dateService.getDates().subscribe( dates => {
        dates.forEach( date => {
          this.turns().forEach( turn => {
            if (turn.hour === date.hour) {
              console.log('match', date)
              turn.turn = date;
            }
          })
        })

        this.matcHours();

       } )

      }

      matcHours(){
      this.hours.set([]);
      this.turns().forEach( turn => {
         console.log(turn.turn, turn.hour)
         if (turn.turn === undefined) {
           this.hours().push({hour:turn.hour});
         }

      } )

      console.log(this.hours())

    }

    showDialog() {
      this.visible = true;
    }

    async agendar(){
      const { name, service, hour } = this.myForm.value;

      await this.dateService.postDates({ name,service:service.service, hour:hour.hour }).subscribe(
        () => {
          this.matchDates();

        }
      );

      if( service.service === 'corte de pelo y barba'){
        await this.dateService.postDatesModified({ name,service:service.service, hour:hour.hour }).subscribe(
          () => {
            this.matchDates();

          }
        );

      }




    }

    onServiceChange(){
      this.myForm.get('service')!.valueChanges.subscribe(
        service => {


          if(service.service=== 'corte de pelo y barba'){
            this.filterHours();
          }else{
            this.matcHours();
          }
        }
      )
    }


    filterHours(){
      // Crear un nuevo arreglo para almacenar las horas que cumplen con el criterio
    const filteredHours = [];

    // Iterar sobre las horas
    for (let i = 0; i < this.hours().length; i++) {
        const currentHour = this.hours()[i];
        const [hour, minutes] = currentHour.hour.split(':');
        const nextHour = `${parseInt(hour, 10) + 1}:00` ;
        const nextHalfHour = `${parseInt(hour, 10)}:${parseInt(minutes, 10) + 30}`;

        // Comprobar si la siguiente media hora está presente en el arreglo
        let found = false;

        for (let j = i + 1; j < this.hours().length; j++) {
            if (this.hours()[j].hour === ( minutes === '30' ? nextHour : nextHalfHour)) {
                found = true;
                break;
            }
        }

        // Si la siguiente media hora está presente, agregar la hora actual al nuevo arreglo
        if (found) {
            filteredHours.push(currentHour);
        }
    }

    // El nuevo arreglo filteredHours ahora contiene las horas que tienen su siguiente media hora en el arreglo original
    //console.log(filteredHours);
    this.hours.set(filteredHours);
    }


}
