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
export class MapComponent implements OnInit{
  private map: any; 
  private currentLocationMarker: any;
  loading: boolean = true;

  latitude!: number;
  longitude!: number;
  temperature!: number;
  windSpeed!: number;
  windDirection!: string;
  humidity!: number;
  airPressure!: number;
  fires!: number;

  currentDate!: string;
  isForwardDateButtonDisabled: boolean = true;
  constructor(private http: HttpClient, private apiService: ApiService) { }


  ngOnInit() {
    this.getLocation();
    this.initMap();
    this.setCurrentDate();
    setTimeout(() => {
      this.map.invalidateSize(); // Force Leaflet to update its size
    }, 0);
  }


  private initMap() {
    this.map = L.map('map').setView([41.6086, 21.7453], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
  }



  private getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          //this.fetchWeatherDataAndUpdateValues();

          //remove this when you reactivate weatherdata
          var humanIcon = L.icon({
            iconUrl: '../../assets/images/human-icon.png',
            iconSize: [50, 50],  // size of the icon
            iconAnchor: [16, 32],  // point of the icon which will correspond to marker's location
            popupAnchor: [0, -64]  // point from which the popup should open relative to the iconAnchor
          });
          // Create the marker with the custom icon
          this.currentLocationMarker = L.marker([this.latitude, this.longitude], { icon: humanIcon }).addTo(this.map)
            .openPopup();


          this.loading = false;
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

  private setCurrentDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const dd = String(today.getDate()).padStart(2, '0');
    this.currentDate = `${yyyy}-${mm}-${dd}`;
  }

  onDateChange(event: any) {
    this.currentDate = event.target.value;
    this.isForwardDateButtonDisabled = this.checkIfToday(this.currentDate);
  }

  private checkIfToday(date: string): boolean {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    return date === todayStr;
  }

  fetchWeatherDataAndUpdateValues() {
    this.apiService.getCurrentWeather(this.latitude, this.longitude).subscribe(
      (data: any) => {
        this.temperature = Math.round(data.main.temp - 273.15);
        this.windSpeed = data.wind.speed;
        this.windDirection = this.getWindDirection(data.wind.deg);
        this.humidity = data.main.humidity;
        this.airPressure = data.main.pressure;
        // this.fires = data.fires; // Uncomment and update according to your API response structure
        //console.log('Current latutude: ' + this.latitude + '\n' + 'Current longitude: ' + this.longitude);

        var humanIcon = L.icon({
          iconUrl: '../../assets/images/human-icon.png',
          iconSize: [50, 50],  // size of the icon
          iconAnchor: [16, 32],  // point of the icon which will correspond to marker's location
          popupAnchor: [0, -64]  // point from which the popup should open relative to the iconAnchor
        });
        // Create the marker with the custom icon
        this.currentLocationMarker = L.marker([this.latitude, this.longitude], { icon: humanIcon }).addTo(this.map)
          .openPopup();

        this.loading = false;
      },
      error => {
        console.error('Error fetching weather data:', error);
      }
    );
  }

  private getWindDirection(degrees: number): string {
    const directions = ['Север', 'Северо-исток', 'Исток', 'Југо-исток', 'Југ', 'Југо-запад', 'Запад', 'Северо-запад'];
    const index = Math.round(degrees / 45) % 8; // Map degrees to compass direction
    return directions[index];
  }
}
