{-# LANGUAGE OverloadedStrings #-}

module Main where

import Control.Lens
import Database.SQLite.Simple
import Data.ByteString.Lazy ( ByteString )
import Data.Csv ( decode, HasHeader(..) )
import Data.Text ( Text )
import Data.Text.Encoding ( decodeUtf8 )
import Data.Vector ( Vector )
import Network.Wreq

import qualified Data.ByteString.Lazy as B
import qualified Data.Text as T
import qualified Data.Text.Read as TR
import qualified Data.Vector as V

type Header = Vector ByteString
type Row = Vector ByteString
type Rows = Vector Row

dataUrl = "https://docs.google.com/spreadsheets/d/12nE_Wwv6iV9bcf1M7bzSmDHzH6DG7M5a-X1X2SZRQcA/pub?output=csv"

downloadData :: String -> IO (ByteString)
downloadData uri = do
  r <- get uri
  return (r ^. responseBody)

parseCsv :: ByteString -> (Header, Rows)
parseCsv d =
  case decode NoHeader d of
    Right v -> (V.head v, V.tail v)
    Left _ -> (V.empty, V.empty)
    
loadPuolue :: Connection -> Int -> ByteString -> IO ()
loadPuolue _ 0 _ = return ()
loadPuolue conn i v = do
  let p = decodeUtf8 (B.toStrict v)
      q = "INSERT INTO puolueet (id, puolue) VALUES (?, ?)"
  execute conn q (i, p)
  
loadPuolueet :: Connection -> Header -> IO ()
loadPuolueet conn h = do
  putStrLn "Loading table puolueet."
  V.imapM_ (loadPuolue conn) h
  
floatValue :: T.Text -> Maybe Double
floatValue t =
  case TR.double t of
    Right (f, _) -> Just f
    Left _ -> Nothing
  
loadRow :: Connection -> Row -> IO ()
loadRow conn r = do
  let
    m = decodeUtf8 $ B.toStrict $ V.head r
    ts = V.ifoldr justFloats [] $ V.map (floatValue . decodeUtf8 . B.toStrict) $ V.tail r
    q = "INSERT INTO tulokset (month, puolue, tulos) VALUES (?, ?, ?)"
  mapM_ (\(p, t) -> execute conn q (m, p, t)) ts
  where
    justFloats i (Just f) fs = (i + 1, f) : fs
    justFloats _ Nothing fs = fs
  
loadRows :: Connection -> Rows -> IO ()
loadRows conn rs = do
  putStrLn "Loading table tulokset."
  V.mapM_ (loadRow conn) rs
  
loadData :: Connection -> (Header, Rows) -> IO ()
loadData conn (h, rs) = do
  execute_ conn "CREATE TABLE puolueet (id integer not null, puolue text not null)"
  loadPuolueet conn h
  execute_ conn "CREATE TABLE tulokset (month text not null, puolue integer not null, tulos float not null)"
  loadRows conn rs

main :: IO ()
main = do
  d <- downloadData dataUrl
  withConnection "ylepuoluekannatus.sqlite3" (\c -> loadData c (parseCsv d))
  
