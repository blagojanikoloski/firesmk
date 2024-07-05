import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  totalDailyFiresValue = 0;
  constructor(private http: HttpClient, private router: Router, private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getNumberOfFiresToday().subscribe(
      (data: any) => {
        this.totalDailyFiresValue = data;
      },
      error => {
        console.error('Error fetching number of fires today:', error);
      }
    );
  }


  navigateToMap() {
    this.router.navigate(['/map']);
  }

  title = 'firesmk.client';
}
