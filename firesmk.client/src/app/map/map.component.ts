import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'leaflet';
import { environment } from '../../environments/environment';
import { ApiService } from '../services/api.service';

declare let L: any; // Declare Leaflet library

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  private map: any;
  private currentLocationMarker: any;
  loading: boolean = true;

  isWeatherInfoVisible: boolean = false;
  latitude!: number;
  longitude!: number;
  temperature!: number;
  windSpeed!: number;
  windDirection!: string;
  humidity!: number;
  airPressure!: number;
  numberOfFires!: number;

  selectedDate!: string;
  todayDate!: string;
  isForwardDateButtonDisabled: boolean = true;

  private fireMarkers: any[] = [];
  fireData: any[] = [];
  constructor(private http: HttpClient, private apiService: ApiService) { }


  ngOnInit() {
    this.initialize();
  }

  private initialize() {
    // First get location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;

          this.initMap();
          this.setTodayDateAndTodayFires();
          this.fetchClosestFire(this.latitude, this.longitude);
          setTimeout(() => {
            this.map.invalidateSize(); // Force Leaflet to update its size
          }, 0);
          this.fetchWeatherDataAndUpdateValues();
                 
        },
        (error) => {
          console.error('Error getting location:', error);
          // Handle errors or fallback to default location
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      // Handle no geolocation support
    }
  }

  private initMap() {
    this.map = L.map('map').setView([41.6086, 21.7453], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
  }

  private setTodayDateAndTodayFires() {
    this.todayDate = this.formatDate(new Date());
    this.selectedDate = this.todayDate;

    this.apiService.getFiresForDate(this.selectedDate).subscribe(
      (data: any[]) => {
        this.fireData = data;
        this.addFireMarkersToMap(data);
        this.loading = false;
      },
      error => {
        console.error('Error fetching numberOfFires for date:', error);
      }
    );
  }

  onDateChange(event: any) {
    this.selectedDate = event.target.value;
    this.isForwardDateButtonDisabled = this.checkIfToday(this.selectedDate);

    this.apiService.getFiresForDate(this.selectedDate).subscribe(
      (data: any[]) => {
        this.fireData = data;
        this.addFireMarkersToMap(data);
      },
      error => {
        console.error('Error fetching numberOfFires for date:', error);
      }
    );

  }

  private addFireMarkersToMap(fires: any[]) {
    // Clear existing fire markers
    this.fireMarkers.forEach(marker => this.map.removeLayer(marker));
    this.fireMarkers = [];

    // Define custom fire icon
    const fireIcon = L.icon({
      iconUrl: '../../assets/images/fire-icon.png',
      iconSize: [64, 64],     
      iconAnchor: [16, 32],   
      popupAnchor: [0, -32]    
    });

    // Add markers for each fire event using the custom icon
    fires.forEach(fire => {
      const fireMarker = L.marker([fire.latitude, fire.longitude], { icon: fireIcon })
        .addTo(this.map)
        .bindPopup(this.createFirePopupContent(fire));
      this.fireMarkers.push(fireMarker);
    });

    // Define this date's number of fires
    this.numberOfFires = fires.length;
  }

  private createFirePopupContent(fire: any): string {
    const formattedDatetime = fire.datetime.replace('T', ' ');
    const roundedTemperature = (fire.temperature - 273.15).toFixed(1);
    return `
    <div style="font-size: 16px; line-height: 1.5; color: #333;">
      <h3 style="font-size: 20px; margin-bottom: 10px;">Детали</h3>
      <p style="margin: 5px 0;"><strong>Датум:</strong> ${formattedDatetime}</p>
      <p style="margin: 5px 0;"><strong>Температура:</strong> ${roundedTemperature}°C</p>
      <p style="margin: 5px 0;"><strong>Латитуда:</strong> ${fire.latitude}</p>
      <p style="margin: 5px 0;"><strong>Лонгитуда:</strong> ${fire.longitude}</p>
    </div>
  `;
  }

  navigateDateBackward() {
    const selectedDate = new Date(this.selectedDate);
    selectedDate.setDate(selectedDate.getDate() - 1);
    this.updateSelectedDate(selectedDate);
  }

  navigateDateForward() {
    const selectedDate = new Date(this.selectedDate);
    selectedDate.setDate(selectedDate.getDate() + 1);
    this.updateSelectedDate(selectedDate);
  }

  private updateSelectedDate(date: Date) {
    this.selectedDate = this.formatDate(date);
    this.onDateChange({ target: { value: this.selectedDate } });
  }

  private checkIfToday(date: string): boolean {
    const selectedDate = new Date(date);
    const today = new Date();
    return selectedDate.toDateString() === today.toDateString();
  }

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  fetchWeatherDataAndUpdateValues() {
    this.apiService.getCurrentWeather(this.latitude, this.longitude).subscribe(
      (data: any) => {
        this.temperature = Math.round(data.main.temp - 273.15);
        this.windSpeed = data.wind.speed;
        this.windDirection = this.getWindDirection(data.wind.deg);
        this.humidity = data.main.humidity;
        this.airPressure = data.main.pressure;

        var humanIcon = L.icon({
          iconUrl: '../../assets/images/human-icon.png',
          iconSize: [40, 40],
          iconAnchor: [16, 32],
          popupAnchor: [0, -64]
        });
        // Create the marker with the custom icon
        this.currentLocationMarker = L.marker([this.latitude, this.longitude], { icon: humanIcon }).addTo(this.map)
          .openPopup();

      },
      error => {
        console.error('Error fetching weather data:', error);
      }
    );
  }

  toggleWeatherInfo() {
    this.isWeatherInfoVisible = !this.isWeatherInfoVisible;
  }

  private getWindDirection(degrees: number): string {
    const directions = ['Север', 'Северо-исток', 'Исток', 'Југо-исток', 'Југ', 'Југо-запад', 'Запад', 'Северо-запад'];
    const index = Math.round(degrees / 45) % 8; // Map degrees to compass direction
    return directions[index];
  }

  fetchClosestFire(latitude: number, longitude: number): void {
    console.log('Fetching closest fire with coordinates:', latitude, longitude);

    this.apiService.getClosestFire(latitude, longitude).subscribe(
      (data: any) => {
        console.log('Closest fire data:', data);
        if (data.distance < 1000) {
          alert("Има пожар близу до вас!");
        }
      },
      (error) => {
        console.error('Error fetching closest fire:', error);
        // Handle error here
      }
    );
  }

}
