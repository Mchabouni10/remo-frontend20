// src/components/Calculator/WorkItem1.jsx
// Handles the work item name, type, and subtype selection.
// src/components/Calculator/WorkItem1.jsx
// <span style={{ color: 'green' }}>Handles the work item name, type, and subtype selection.</span>
import React from 'react';
import styles from './WorkItem.module.css';

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
        {workItem.type === 'kitchen-flooring' && (
          <>
            <option value="hardwood">Hardwood</option>
            <option value="laminate">Laminate</option>
            <option value="vinyl">Vinyl</option>
            <option value="tile">Tile</option>
          </>
        )}
        {workItem.type === 'kitchen-tiles' && (
          <>
            <option value="ceramic">Ceramic</option>
            <option value="porcelain">Porcelain</option>
            <option value="mosaic">Mosaic</option>
          </>
        )}
        {workItem.type === 'kitchen-backsplash' && (
          <>
            <option value="subway">Subway</option>
            <option value="glass">Glass</option>
            <option value="stone">Stone</option>
          </>
        )}
        {workItem.type === 'kitchen-cabinets' && (
          <>
            <option value="standard">Standard</option>
            <option value="custom">Custom</option>
          </>
        )}
        {workItem.type === 'kitchen-sink' && (
          <>
            <option value="stainless">Stainless Steel</option>
            <option value="composite">Composite</option>
          </>
        )}
        {workItem.type === 'kitchen-faucet' && (
          <>
            <option value="single-handle">Single Handle</option>
            <option value="double-handle">Double Handle</option>
          </>
        )}
        {workItem.type === 'kitchen-lighting' && (
          <>
            <option value="pendant">Pendant</option>
            <option value="recessed">Recessed</option>
          </>
        )}
        {workItem.type === 'bathroom-flooring' && (
          <>
            <option value="tile">Tile</option>
            <option value="vinyl">Vinyl</option>
          </>
        )}
        {workItem.type === 'bathroom-tiles' && (
          <>
            <option value="ceramic">Ceramic</option>
            <option value="porcelain">Porcelain</option>
          </>
        )}
        {workItem.type === 'bathroom-shower-tiles' && (
          <>
            <option value="porcelain">Porcelain</option>
            <option value="glass">Glass</option>
          </>
        )}
        {workItem.type === 'bathroom-vanity' && (
          <>
            <option value="single-sink">Single Sink</option>
            <option value="double-sink">Double Sink</option>
          </>
        )}
        {workItem.type === 'bathroom-faucet' && (
          <>
            <option value="single-handle">Single Handle</option>
            <option value="widespread">Widespread</option>
          </>
        )}
        {workItem.type === 'bathroom-shower-faucet' && (
          <>
            <option value="rain">Rain</option>
            <option value="handheld">Handheld</option>
          </>
        )}
        {workItem.type === 'bathroom-fan' && (
          <>
            <option value="standard">Standard</option>
            <option value="quiet">Quiet</option>
          </>
        )}
        {workItem.type === 'bathroom-towel-warmer' && (
          <>
            <option value="wall-mounted">Wall Mounted</option>
            <option value="freestanding">Freestanding</option>
          </>
        )}
        {workItem.type === 'living-room-flooring' && (
          <>
            <option value="hardwood">Hardwood</option>
            <option value="carpet">Carpet</option>
          </>
        )}
        {workItem.type === 'living-room-lighting' && (
          <>
            <option value="chandelier">Chandelier</option>
            <option value="recessed">Recessed</option>
          </>
        )}
        {workItem.type === 'bedroom-flooring' && (
          <>
            <option value="carpet">Carpet</option>
            <option value="hardwood">Hardwood</option>
          </>
        )}
        {workItem.type === 'bedroom-lighting' && (
          <>
            <option value="recessed">Recessed</option>
            <option value="ceiling-fan">Ceiling Fan</option>
          </>
        )}
        {workItem.type === 'exterior-deck' && (
          <>
            <option value="wood">Wood</option>
            <option value="composite">Composite</option>
          </>
        )}
        {workItem.type === 'general-drywall' && (
          <>
            <option value="standard">Standard</option>
            <option value="moisture-resistant">Moisture Resistant</option>
          </>
        )}
        {workItem.type === 'general-painting' && (
          <>
            <option value="interior">Interior</option>
            <option value="exterior">Exterior</option>
          </>
        )}
        {workItem.type === 'general-lighting' && (
          <>
            <option value="recessed">Recessed</option>
            <option value="track">Track</option>
          </>
        )}
        {workItem.type === 'general-doors' && (
          <>
            <option value="interior">Interior</option>
            <option value="exterior">Exterior</option>
          </>
        )}
        {workItem.type === 'general-windows' && (
          <>
            <option value="double-hung">Double Hung</option>
            <option value="casement">Casement</option>
          </>
        )}
        {workItem.type === 'general-trim' && (
          <>
            <option value="standard">Standard</option>
            <option value="decorative">Decorative</option>
          </>
        )}
        {workItem.type === 'general-crown-molding' && (
          <>
            <option value="simple">Simple</option>
            <option value="ornate">Ornate</option>
          </>
        )}
        {workItem.type === 'general-baseboards' && (
          <>
            <option value="standard">Standard</option>
            <option value="tall">Tall</option>
          </>
        )}
      </select>
    </div>
  );
}