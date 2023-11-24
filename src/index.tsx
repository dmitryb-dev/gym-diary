import ReactDOM from 'react-dom/client';
import { Diary } from './components/Diary.tsx';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(<Diary/>);