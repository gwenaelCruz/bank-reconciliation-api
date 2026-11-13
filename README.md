# Bank reconciliation API

## Context:

As an accountant, I need to retrieve my clients’ bank transactions. This bank data synchronisation is managed by external service providers.
These service providers use ‘web scraping’ to retrieve transactions from the banks’ websites.
This technique is not foolproof, and it sometimes happens that certain transactions are recorded twice or that some are missing.
It is essential that I ensure the integrity of this synchronisation; otherwise, our clients’ accounts could be inaccurate.

## Problem:

> How to I make sure synchronised operations are correct ?

I ask the client to provide me with their bank statements. This enables me to have checkpoints throughout the year based on the balance shown at the end of each statement period. The balance shown on a bank statement is accurate. **Please note**: a bank statement is not necessarily issued monthly.
In the event of an anomaly, an accountant carries out a check to remove duplicates or manually create any missing transactions.
Given a list of banking transactions, as well as these checkpoints, an algorithm and its interface must be defined to validate the integrity of the synchronisation and, where necessary, to simplify the accountant’s manual checks as much as possible.

### Data structure
#### Bank operation
```ts 
{ 
  id: number, 
  date: Date, 
  wording: string, 
  amount: number 
}
```

#### Control point
```ts
{
  date: Date,
  balance: number
}
```

## Technical spec:

#### Request
`POST /movements/validation`
```json
{ 
  "movements": [{ id, date, label, amount }],  
  "balances": [{ date, balance }]
}
```

#### Response
Success
```json
{
  "message": "Accepted"
}
```

Error
```json
{
  "message": "Validation failed",
  "reasons": [{ … }]
}
```
