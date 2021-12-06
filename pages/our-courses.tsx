import type { NextPage } from 'next'
import Head from 'next/head'
import { Header } from '../components/Layout';

type IProps = {}

const Page: NextPage<IProps> = () => {
    
    
  return (
    <div className='bg-adhdPurple min-h-screen text-adhdBlue'>
      <Head>
        <title>Update password - ADHD Together</title>
        <meta name="description" content="Session rooms for ADHD Together" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className='bg-gray-100 min-h-screen w-screen'>
        <Header />
        {/* <main className='max-w-5xl mx-auto pt-6 pb-6'> */}
            <div className="">
                <div className="text-black">
                    <div className="grid grid-cols-2 gap-5">
                        <div className="flex items-center content-center justify-center	">
                            <div className="w-4/5">
                            <h2 className="mb-4 text-4xl font-bold">Our Courses</h2>
                                <div className="mb-4">
                                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod, voluptas inventore vel repudiandae quam nesciunt officia, rerum officiis eligendi sint dolorum nemo saepe porro laboriosam vero molestias error, omnis nostrum. 
                                </div>
                                <a className="button" target="_blank" href="https://brandonjackson.typeform.com/to/JFz8XJjf?typeform-source=www.google.com" rel="noopener noreferrer">
                                        Register Interest
                                </a>
                            </div>
                        </div>
                        <div className="">
                            <img className="height-vh-without-header w-full	" src="https://images.pexels.com/photos/8378728/pexels-photo-8378728.jpeg?cs=srgb&dl=pexels-tara-winstead-8378728.jpg&fm=jpg"
                                    alt="Hero" />
                        </div>
                    </div>
                </div>
            </div>
        {/* </main> */}
      </div>
    </div>
  )
}

export default Page
