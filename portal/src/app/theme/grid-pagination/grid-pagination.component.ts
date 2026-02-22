import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'evntaly-grid-pagination',
  templateUrl: './grid-pagination.component.html',
  styleUrls: ['./grid-pagination.component.css']
})
export class GridPaginationComponent implements OnInit {
  @Input() pageSize: any;
  @Input() collectionSize: any;
  @Input() selectedPage: any;
  @Input() maxSize: any;
  @Output() changePage = new EventEmitter<any>();

  totalPagesSliders: any[] = [];
  sliderOnView = [];
  sliderOnViewIndex = 0;
  currentSlectedSlider = 1;
  showNextSliderNavigator: boolean = false;
  showPrevSliderNavigator: boolean = false;
  activePage: number = 1;
  limit: number | undefined;
  skip: number | undefined;

  constructor() { }

  ngOnInit() {
    let totalPages = Array.from({ length: this.generateNumberOfPages() }, (_, i) => i + 1)
    this.generatePageSliders(totalPages);
    this.getCurrentSlider(this.currentSlectedSlider);
  }

  generateNumberOfPages(){
    let numberOfPages = Math.ceil(Number(this.collectionSize) / Number(this.pageSize));
    return numberOfPages;
  };

  generatePageSliders(totalPages: any[]){
    let startFrom = 0;
    let endAt = this.maxSize;
    let numberOfIterations = Math.ceil(totalPages.length / Number(this.maxSize));

    for (let index = 0; index < numberOfIterations; index++) {
      let slide: any[] = []
      if(Number(totalPages.length) - Number(endAt) < this.maxSize){
        slide = totalPages.slice(startFrom , totalPages.length);
        this.totalPagesSliders.push(slide);

        break;
      } else {
        slide = totalPages.slice(startFrom , endAt);
      }

      startFrom += this.maxSize;
      endAt += this.maxSize;

      this.totalPagesSliders.push(slide);
    }
  };

  getCurrentSlider(sliderNumebr: number){
    this.sliderOnViewIndex = sliderNumebr - 1;
    this.sliderOnView = this.totalPagesSliders[sliderNumebr - 1];
    this.nextSliderNavigatorHandler();
    this.prevSliderNavigatorHandler();
  };

  getNextSlider(){
    this.currentSlectedSlider = this.currentSlectedSlider + 1;
    this.getCurrentSlider(this.currentSlectedSlider)
  };

  getPrevSlider(){
    this.currentSlectedSlider = this.currentSlectedSlider - 1;
    this.getCurrentSlider(this.currentSlectedSlider)
  };

  nextSliderNavigatorHandler(){
    if(this.totalPagesSliders.length > 0 && this.sliderOnViewIndex < this.totalPagesSliders.length - 1 ){
      this.showNextSliderNavigator = true;
    } else {
      this.showNextSliderNavigator = false;
    }
  };

  prevSliderNavigatorHandler(){
    this.showPrevSliderNavigator =  this.sliderOnViewIndex > 0 ? true: false;
  };

  changeSelectedPage(pageNumber: number){
    this.activePage = pageNumber;
    this.limit = this.pageSize * pageNumber;
    this.skip = Math.abs(this.pageSize - this.limit);

    this.changePage.emit({ skip: this.skip , limit: this.limit });
  };
}
