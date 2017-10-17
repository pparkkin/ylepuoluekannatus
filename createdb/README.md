# createdb

```
€ stack build
€ stack exec createdb
Loading table puolueet.
Loading table tulokset.
€ sqlite3 ylepuoluekannatus.sqlite3
SQLite version 3.16.0 2016-11-04 19:09:39
Enter ".help" for usage hints.
sqlite> select month, p.puolue, tulos from tulokset as t join puolueet as p on t.puolue = p.id where p.puolue = 'KOK' limit 10;
2006-01-01|KOK|20.2
2006-02-01|KOK|20.9
2006-03-01|KOK|21.9
2006-04-01|KOK|21.5
2006-05-01|KOK|20.8
2006-06-01|KOK|20.9
2006-08-01|KOK|20.8
2006-09-01|KOK|20.6
2006-10-01|KOK|20.0
2006-11-01|KOK|19.8
``` 
