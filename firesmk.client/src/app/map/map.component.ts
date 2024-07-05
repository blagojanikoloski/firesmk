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

  constructor(private http: HttpClient, private apiService: ApiService) { }


  ngOnInit() {
    this.getLocation();
    this.initMap();
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

        this.currentLocationMarker = L.marker([this.latitude, this.longitude]).addTo(this.map)
          .bindPopup('Your current location')
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
