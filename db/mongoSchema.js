// MongoDB object design
/**
{
  review_id: int,
  product_id: int,
  rating: int,
  summary: string,
  recommend: bool,
  response: string,
  body: string,
  date: string/date,
  helpfulness: int,
  photos: [{id: int, url: string}],
  characteristics: {
    "Characteristic_Name": {
      id: int,
      value: float
    }
  },
  reported: int
}
*/

// Maria table design
/**

REVIEW TABLE
  review_id: int PRIMARY KEY
  product_id: int 'Foreign Key'
  rating: int,
  summary: string,
  recommend: bool,
  response: string,
  body: string,
  date: string/date,
  helpfulness: int,
  reported: int

PHOTO TABLE
  photo_id: int PRIMARY KEY
  review_id: int FOREIGN KEY
  url: string

CHARACTERISTICS TABLE
  row_id: int PRIMARY KEY
  review_id: int FOREIGN KEY
  characteristic_id: int
  characteristic_name: string
  value: string
*/