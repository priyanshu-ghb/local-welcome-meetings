import type { NextPage } from 'next'
import Head from 'next/head'
import { useState } from 'react';
import { Header } from '../components/Layout';

type IProps = {}

const Page: NextPage<IProps> = () => {
    const [currentSalary, setCurrentSalary] = useState(0);
    const [howManySession, setHowManySession] = useState(4);
    const [result, setResult] = useState(0);
    const calculateTotalPrice = () =>{
        if(currentSalary > 0){
            if(currentSalary <= 40000 ){
                setResult(10*howManySession)
            }else{
                setResult(20*howManySession)
            }
        }
    }
    
  return (
    <div className='bg-adhdPurple min-h-screen text-adhdBlue'>
      <Head>
        <title>Update password - ADHD Together</title>
        <meta name="description" content="Session rooms for ADHD Together" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className='bg-gray-100 min-h-screen w-screen'>
        <Header />
        <main className='max-w-5xl mx-auto pt-6 pb-6'>
            <div className="max-w-5xl mx-auto bg-adhdPurple text-white p-5 rounded border">
                <h2 className="mb-2 text-3xl font-bold">Calculate course pricing</h2>
                <div>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
                    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                    quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
                    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
                    proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </div>
                <div className="grid grid-cols-1 gap-2 pt-5 pb-5">
                    <div>
                        <label className="font-medium pb-1 block text-sm">Salary</label>
                        <input className="w-full text-adhdPurple" onChange={(e)=>setCurrentSalary(e.target.value)} defaultValue={currentSalary} type="number" name="salary" />
                    </div>
                    <div>
                        <label className="font-medium pb-1 block text-sm">Session</label>
                        <input className="w-full text-adhdPurple" type="number" onChange={(e)=>setHowManySession(e.target.value)} defaultValue={howManySession} name="session" />
                    </div>
                </div>
                <button className="button" onClick={()=>calculateTotalPrice()}>Calculate Price</button>
                
                {result > 0 && <div className="pt-5 text-3xl">Session cost is <strong>{`£${result}`}</strong></div>}
            </div>
        </main>
      </div>
    </div>
  )
}

export default Page
