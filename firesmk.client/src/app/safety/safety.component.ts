import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'leaflet';
import { environment } from '../../environments/environment';
import { ApiService } from '../services/api.service';

declare let L: any; // Declare Leaflet library

@Component({
  selector: 'app-safety',
  templateUrl: './safety.component.html',
  styleUrls: ['./safety.component.css']
})
export class SafetyComponent implements OnInit {

  constructor(private http: HttpClient, private apiService: ApiService) { }


  ngOnInit() {

  }



}
