import yfinance as yf
import pandas as pd
import pickle



def load_from_yahoo(tickers):
    output = dict()
    for ticker in tickers:
        output[ticker] = yf.download(ticker, period="max")
    return output

//..load_to_pickle_batch(){
def load_to_pickle_batch(path, tickers, batch_size):

    counter = 0
    temp_path = path
    for i in range(int(len(tickers)/batch_size)):
        temp_path = path.split("/")
        temp_path[-1] = str(i) + "_" + temp_path[-1]
        temp_path = "/".join(temp_path)
        with open(temp_path, 'wb+') as file:
            pickle.dump(tickers[counter:(counter+batch_size)], file)
        counter += batch_size
        print("Finished batch: " + str(i+1) + " of " + str(int(len(tickers)/batch_size)))
}  
    

if __name__ == "__main__":
    tickers = ["VIX",'SDRL','AA','INO','AXP','VZ','SPWH','BA','SABR','PEP','CAT','JPM']
    data = load_from_yahoo = load_from_yahoo(tickers)
    load_to_pickle_batch("./data.pickle", tickers, 2)