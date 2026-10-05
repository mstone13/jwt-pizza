import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  CautionIcon,
  CloseEyeIcon,
  CloseIcon,
  EmailIcon,
  GreaterThanIcon,
  HamburgerIcon,
  HouseIcon,
  KeyIcon,
  LocationIcon,
  PersonIcon,
  StoreIcon,
  TrashIcon,
} from '../src/icons';

const icons = [
  CautionIcon,
  CloseEyeIcon,
  CloseIcon,
  EmailIcon,
  GreaterThanIcon,
  HamburgerIcon,
  HouseIcon,
  KeyIcon,
  LocationIcon,
  PersonIcon,
  StoreIcon,
  TrashIcon,
];

createRoot(document.getElementById('root')!).render(
  <main>
    {icons.map((Icon, index) => (
      <div key={index} data-testid="icon">
        <Icon className="" />
      </div>
    ))}
  </main>,
);
