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
  latestDataFetch = 'Се вчитува..';
  constructor(private http: HttpClient, private router: Router, private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getNumberOfFiresToday().subscribe(
      (data: any) => {
        this.totalDailyFiresValue = data;
        const counterElement = document.getElementById('counter');
        if (counterElement) {
          counterElement.textContent = this.totalDailyFiresValue.toString();
        }

      },
      error => {
        console.error('Error fetching number of fires today:', error);
      }
    );

    this.apiService.getLatestDataFetch().subscribe(
      (data: any) => {
        this.latestDataFetch = this.formatDateTime(data.lastFireDataFetch);
      },
      error => {
        console.error('Error fetching last data gather info:', error);
      }
    );
  }

  formatDateTime(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    };
    const date = new Date(dateString);
    return date.toLocaleString(undefined, options);
  }

  navigateToMap() {
    this.router.navigate(['/map']);
  }

  title = 'firesmk.client';
}
