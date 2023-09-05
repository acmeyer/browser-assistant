import logo from '@assets/img/logo.svg';

export default function Newtab(): JSX.Element {
  return (
    <div className='text-center'>
      <header className='flex flex-col bg-white dark:bg-zinc-800 items-center justify-center min-h-screen dark:text-white text-zinc-900'>
        <img src={logo} className='h-40' alt='logo' />
        <p className='text-base'>
          Edit <code>src/pages/newtab/Newtab.tsx</code> and save to reload.
        </p>
        <a
          className='text-blue-400 hover:text-blue-600 underline text-base'
          href='https://reactjs.org'
          target='_blank'
          rel='noopener noreferrer'
        >
          Learn React!
        </a>
      </header>
    </div>
  );
}
