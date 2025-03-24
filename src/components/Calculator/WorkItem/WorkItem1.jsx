// src/components/Calculator/WorkItem/WorkItem1.jsx
import React from 'react';
import styles from './WorkItem.module.css';
import { SUBTYPE_OPTIONS } from '../calculatorFunctions';

export default function WorkItem1({ workItem, updateWorkItem, disabled }) {
  return (
    <div className={styles.container}>
      <span className={styles.workName}>{workItem.name || 'Unnamed Work'}</span>
      <select
        value={workItem.type || ''}
        onChange={(e) => updateWorkItem('type', e.target.value)}
        className={styles.select}
        disabled={disabled}
      >
        <option value="">Select Type</option>
        <optgroup label="Kitchen">
          <option value="kitchen-flooring">Flooring</option>
          <option value="kitchen-tiles">Tiles</option>
          <option value="kitchen-backsplash">Backsplash</option>
          <option value="kitchen-cabinets">Cabinets</option>
          <option value="kitchen-sink">Sink</option>
          <option value="kitchen-faucet">Faucet</option>
          <option value="kitchen-lighting">Lighting</option>
        </optgroup>
        <optgroup label="Bathroom">
          <option value="bathroom-flooring">Flooring</option>
          <option value="bathroom-tiles">Tiles</option>
          <option value="bathroom-shower-tiles">Shower Tiles</option>
          <option value="bathroom-vanity">Vanity</option>
          <option value="bathroom-faucet">Faucet</option>
          <option value="bathroom-shower-faucet">Shower Faucet</option>
          <option value="bathroom-fan">Fan</option>
          <option value="bathroom-towel-warmer">Towel Warmer</option>
        </optgroup>
        <optgroup label="Living Room">
          <option value="living-room-flooring">Flooring</option>
          <option value="living-room-lighting">Lighting</option>
        </optgroup>
        <optgroup label="Bedroom">
          <option value="bedroom-flooring">Flooring</option>
          <option value="bedroom-lighting">Lighting</option>
        </optgroup>
        <optgroup label="Exterior">
          <option value="exterior-deck">Deck</option>
        </optgroup>
        <optgroup label="General">
          <option value="general-drywall">Drywall</option>
          <option value="general-painting">Painting</option>
          <option value="general-lighting">Lighting</option>
          <option value="general-doors">Doors</option>
          <option value="general-windows">Windows</option>
          <option value="general-trim">Trim</option>
          <option value="general-crown-molding">Crown Molding</option>
          <option value="general-baseboards">Baseboards</option>
        </optgroup>
      </select>
      <select
        value={workItem.subtype || ''}
        onChange={(e) => updateWorkItem('subtype', e.target.value)}
        className={styles.select}
        disabled={!workItem.type || disabled}
      >
        <option value="">Select Subtype</option>
        {(SUBTYPE_OPTIONS[workItem.type] || []).map((option) => (
          <option key={option} value={option}>
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}