const axios = require('axios');
const BN = require('bn.js');


async function GetDeposits(){
    const result = await axios.post('https://api.thegraph.com/subgraphs/name/aave/aave-v2-polygon-mumbai',
        {
            query: `
            {
                
                    userReserves(where: { user: "0x51571107cb5c25b3ef36b714cbad17f6f900b936"}) {
                      
                      reserve{
                        symbol
                      }
                      depositHistory{
                        amount
                      }
                    }
                  
            }
            `
        }
    );
    const res = result.data.data.userReserves;
    let mp =new Map();
    for(let i=0;i<res.length;i++)
    {
        let symbol =  res[i].reserve.symbol;
        let amt = new BN(0);
        
        const arr = res[i].depositHistory
        for(let j=0;j<arr.length;j++)
        amt.add(arr[j]);
        mp[symbol]=amt;
    }
    return mp;
}

GetDeposits();