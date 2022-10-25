import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  ViewChild,
} from '@angular/core';
import {
  animationFrames,
  BehaviorSubject,
  EMPTY,
  exhaustMap,
  fromEvent,
  interval,
  map,
  Observable,
  OperatorFunction,
  pairwise,
  pipe,
  ReplaySubject,
  share,
  Subject,
  switchMap,
  takeUntil,
  timer,
} from 'rxjs';

import {
  filter,
  finalize,
  mergeMap,
  takeWhile,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('fighterShip') fighterShipEl?: ElementRef<HTMLImageElement>;

  fighterShipPosition$ = new ReplaySubject<{ x: number; y: number }>(1);

  monsters: HTMLImageElement[] = [];

  // keydown$ = fromEvent<KeyboardEvent>(document, 'keydown');
  // keyup$ = fromEvent<KeyboardEvent>(document, 'keyup');
  // deltaTime$ = this.deltaTime().pipe(share());

  // x$ = new BehaviorSubject<number>(0);
  // y$ = new BehaviorSubject<number>(0);

  constructor(private zone: NgZone) {}
  // title = 'test-schematics';

  // myFromEvent(element: any, eventName: string) {
  //   return new Observable<KeyboardEvent>((subscriber) => {
  //     element.addEventListener(eventName, (event: any) => {
  //       subscriber.next(event);
  //     });
  //   });
  // }

  ngAfterViewInit(): void {
    const element = this.fighterShipEl?.nativeElement;
    if (element) {
      fromEvent(element, 'load')
        .pipe(
          switchMap(() => {
            element.style.position = 'fixed';
            return fromEvent<MouseEvent>(document, 'mousemove').pipe(
              tap((event) => {
                const { width, height } = element.getBoundingClientRect();
                const x = event.x - width / 2;
                const y = event.y - height / 2;
                element.style.left = `${x}px`;
                element.style.top = `${y}px`;
                this.fighterShipPosition$.next({ x: event.x, y: event.y });
              })
            );
          })
        )
        .subscribe();
    }

    fromEvent(document, 'mousedown')
      .pipe(
        withLatestFrom(this.fighterShipPosition$),
        mergeMap(([event, position]) => {
          event.preventDefault();
          const missileEl = document.createElement('img');
          missileEl.src =
            'https://cdn-icons-png.flaticon.com/512/123/123369.png';
          missileEl.style.position = 'fixed';
          missileEl.style.width = '30px';
          missileEl.style.visibility = 'hidden';

          document.body.appendChild(missileEl);
          return fromEvent(missileEl, 'load').pipe(
            finalize(() => {
              missileEl.remove();
            }),
            switchMap(() => {
              const { width, height } = missileEl.getBoundingClientRect();
              let x = position.x - width / 2;
              let y = position.y - height / 2;
              missileEl.style.left = `${x}px`;
              missileEl.style.top = `${y}px`;
              missileEl.style.visibility = 'unset';

              return this.deltaTime().pipe(
                tap((time) => {
                  y -= time * 500;
                  missileEl.style.top = `${y}px`;
                })
              );
            }),

            takeWhile(() => {
              const { y: currentY } = missileEl.getBoundingClientRect();
              const crashedWithMonster = this.monsters.some((m) =>
                this.rectIntersect(
                  m.getBoundingClientRect(),
                  missileEl.getBoundingClientRect()
                )
              );

              return !crashedWithMonster && currentY > 0;
            })
          );
        })
      )
      .subscribe();

    const windowIsVisible$ = fromEvent(document, 'visibilitychange').pipe(
      map(() => !document.hidden)
    );

    windowIsVisible$
      .pipe(
        switchMap((isVisible) => {
          if (isVisible) {
            return timer(0, 2000).pipe(
              mergeMap(() => {
                return this.createMonster();
              })
            );
          }
          return EMPTY;
        })
      )
      .subscribe();

    // const requestPokemonPromise$ = new Promise((resolve, reject) => {
    //   fetch('https://pokeapi.co/api/v2/pokemon/pikachu')
    //     .then((res) => res.json())
    //     .then((data) => {
    //       resolve(data);
    //       resolve(data);
    //       resolve(data);
    //       resolve(data);
    //     }).catch(err=>{
    //       reject(err);
    //     })
    // });

    // requestPokemonPromise$.then(value=>{
    //   console.log('promise:',value)
    // }).catch(err=>{
    //   console.log('promise error',err);
    // })

    // const requestPokemonObservable$ = new Observable((subscriber) => {
    //   fetch('https://pokeapi.co/api/v2/pokemon/pikachu')
    //     .then((res) => res.json())
    //     .then((data) => {
    //       subscriber.next(data);
    //       subscriber.complete();

    //       // subscriber.complete();
    //     }).catch(err=>{
    //       subscriber.error(err)
    //     })
    // });

    // requestPokemonObservable$.subscribe({
    //   next:(data)=>{
    //     console.log('observable:',data);
    //   },
    //   error:(err)=>{
    //     console.log('observable error',err)
    //   },
    //   complete:()=>{
    //     console.log('observerable complete')
    //   }
    // })

    // const keydown$ = this.myFromEvent(document, 'keydown');
    // const keyup$ = this.myFromEvent(document, 'keyup');

    // keydown$.subscribe(event=>{
    //   console.log(event)
    // })

    // keydown$
    //   .pipe(
    //     filter((event) => event.key === 'ArrowLeft'),
    //     switchMap((keydownEvent) => {
    //       console.log('test')
    //       const keyupArrowLeft$ = keyup$.pipe(filter(event=>event.key==='ArrowLeft'))

    //       // return interval(1000).pipe(takeUntil(keyupArrowLeft$))
    //       return interval(1000);
    //     })
    //   )
    //   .subscribe((num) => console.log(num));

    // keydown$
    //   .pipe(filter((event) => event.key !== 'ArrowLeft'))
    //   .subscribe((event) => {
    //     console.log('not ArrowLeft');
    //   });

    // document.addEventListener('keyup',event=>{
    //   console.log(event)
    // })

    // fromEvent(document, 'keydown').subscribe(evnet=>{
    //   console.log(event)
    // })

    // console.log(this.fighterShipEl?.nativeElement);
    // this.zone.runOutsideAngular(() => {
    //   if (this.fighterShipEl) {
    //     const speedX = 800;
    //     const speedY = 800;
    //     const element = this.fighterShipEl.nativeElement;
    //     this.fromKeydown('ArrowRight')
    //       .pipe(this.withDeltaTimeUntilKeyUp())
    //       .subscribe((delta) => {
    //         const dx = delta * speedX;
    //         this.x$.next(this.x$.value + dx);
    //       });

    //     this.fromKeydown('ArrowLeft')
    //       .pipe(this.withDeltaTimeUntilKeyUp())
    //       .subscribe((delta) => {
    //         const dx = delta * speedX;
    //         this.x$.next(this.x$.value - dx);
    //       });

    //     this.fromKeydown('ArrowUp')
    //       .pipe(this.withDeltaTimeUntilKeyUp())
    //       .subscribe((delta) => {
    //         const dy = delta * speedY;
    //         this.y$.next(this.y$.value - dy);
    //       });

    //     this.fromKeydown('ArrowDown')
    //       .pipe(this.withDeltaTimeUntilKeyUp())
    //       .subscribe((delta) => {
    //         const dy = delta * speedY;
    //         this.y$.next(this.y$.value + dy);
    //       });

    //     element.style.position = 'fixed';

    //     this.x$.subscribe((x) => {
    //       element.style.left = `${x}px`;
    //     });

    //     this.y$.subscribe((y) => {
    //       element.style.top = `${y}px`;
    //     });
    //   }
    // });
  }

  // fromKeydown(key: string) {
  //   return this.keydown$.pipe(filter((event) => event.key === key));
  // }

  // withDeltaTimeUntilKeyUp(): OperatorFunction<KeyboardEvent, number> {
  //   return pipe(
  //     exhaustMap((keydownEvent) => {
  //       const keyupAsKeydown$ = this.keyup$.pipe(
  //         filter((upEvent) => upEvent.key === keydownEvent.key)
  //       );
  //       return this.deltaTime$.pipe(takeUntil(keyupAsKeydown$));
  //     })
  //   );
  // }

  rectIntersect(source: DOMRect, target: DOMRect) {
    if (
      source.x > target.x &&
      source.x < target.x + target.width &&
      source.y + source.height > target.y &&
      source.y < target.y
    ) {
      return true;
    } else if (
      source.x > target.x &&
      source.x < target.x + target.width &&
      source.y < target.y + target.height &&
      source.y > target.y
    ) {
      return true;
    } else if (
      Math.abs(target.x - source.x) <= source.width / 2 &&
      source.y + source.height > target.y &&
      source.y < target.y + target.height
    ) {
      return true;
    } else if (
      Math.abs(target.x + target.width - source.x) <= source.width / 2 &&
      source.y + source.height > target.y &&
      source.y < target.y + target.height
    ) {
      return true;
    }
    return false;
  }

  createMonster() {
    const monsterEl = document.createElement('img');
    monsterEl.src =
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/%D0%9C%D0%B8%D0%BD_%D0%90%D1%83%D0%BD_%D0%A5%D0%BB%D0%B0%D0%B9%D0%BD_%D0%B2_%D0%A2%D0%B0%D1%82%D0%B0%D1%80%D1%81%D1%82%D0%B0%D0%BD%D0%B5_04_%2825-06-2021%29_%28cropped_3%29.jpg/220px-%D0%9C%D0%B8%D0%BD_%D0%90%D1%83%D0%BD_%D0%A5%D0%BB%D0%B0%D0%B9%D0%BD_%D0%B2_%D0%A2%D0%B0%D1%82%D0%B0%D1%80%D1%81%D1%82%D0%B0%D0%BD%D0%B5_04_%2825-06-2021%29_%28cropped_3%29.jpg';
    monsterEl.alt = 'kraken';
    monsterEl.style.visibility = 'hidden';
    monsterEl.style.position = 'fixed';
    const randomWidth = this.getRandomInt(100, 320);
    monsterEl.style.width = `${randomWidth}px`;
    document.body.append(monsterEl);
    this.monsters.push(monsterEl);
    return fromEvent(monsterEl, 'load').pipe(
      finalize(() => {
        monsterEl.remove();
        const index = this.monsters.findIndex((m) => m === monsterEl);
        this.monsters.splice(index, 1);
      }),
      switchMap(() => {
        const { width, height } = monsterEl.getBoundingClientRect();
        const x = this.getRandomInt(0, window.innerWidth - width);
        let y = -height;
        monsterEl.style.left = `${x}px`;
        monsterEl.style.top = `${y}px`;
        monsterEl.style.visibility = 'unset';

        return this.deltaTime().pipe(
          map((deltaTime) => {
            y += deltaTime * 200;
            monsterEl.style.top = `${y}px`;

            return monsterEl;
          })
        );
      }),
      takeWhile(() => {
        const { y, height } = monsterEl.getBoundingClientRect();

        return y < window.innerHeight + height;
      })
    );
  }

  deltaTime() {
    return animationFrames().pipe(
      pairwise(),
      map(([prev, curr]) => (curr.elapsed - prev.elapsed) / 1000)
    );
  }

  getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
  }
}
