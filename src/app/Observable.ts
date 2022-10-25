interface MyObserver<T> {
  next: (value: T) => void;
  error: (err: any) => void;
  complete: () => void;
}

type SubscriberFn<T> = (observer: MyObserver<T>) => void;

export class MyObservable<T> {
  constructor(public subscriberFn: SubscriberFn<T>) {}


  subscribe(observer: MyObserver<T>) {
    this.subscriberFn(observer);
  }
}

const requestPokemon$ = new MyObservable((subscriber) => {
  fetch('https://pokeapi.co/api/v2/pokemon/ditto')
    .then((res) => res.json())
    .then((data) => {
      subscriber.next(data);
      subscriber.complete();
    });
});

requestPokemon$.subscribe({
  next: (data) => console.log(data),
  error: () => {},
  complete: () => {
    console.log('complete')
  },
});
