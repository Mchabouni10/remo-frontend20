import React, { useState } from 'react';
import styles from './PricingSheet.module.css';

export default function LaborPricingSheet() {
  const [expandedSections, setExpandedSections] = useState(new Set(['bathroom']));
  const [searchTerm, setSearchTerm] = useState('');

  const toggleSection = (section) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      newSet.has(section) ? newSet.delete(section) : newSet.add(section);
      return newSet;
    });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  // Labor pricing data (Illinois, 2023–2025, mid-range, fair)
  const laborData = {
    kitchen: {
      icon: 'fa-utensils',
      surfaceBased: [
        { type: 'kitchen-flooring', description: 'Install hardwood, tile, vinyl', firstFloor: '$4–$7/sqft', secondFloor: '$4.60–$8.05/sqft' },
        { type: 'kitchen-backsplash', description: 'Install ceramic, glass tiles', firstFloor: '$10–$20/sqft', secondFloor: '$11.50–$23/sqft' },
        { type: 'kitchen-ceiling', description: 'Install drywall, paint', firstFloor: '$2–$5/sqft', secondFloor: '$2.30–$5.75/sqft' },
      ],
      linearFtBased: [
        { type: 'kitchen-cabinets', description: 'Install stock or custom cabinets', firstFloor: '$50–$150/linear ft', secondFloor: '$57.50–$172.50/linear ft' },
        { type: 'kitchen-countertops', description: 'Install granite, quartz', firstFloor: '$20–$50/linear ft', secondFloor: '$23–$57.50/linear ft' },
        { type: 'kitchen-trim', description: 'Install baseboards, molding', firstFloor: '$5–$10/linear ft', secondFloor: '$5.75–$11.50/linear ft' },
      ],
      unitBased: [
        { type: 'kitchen-sink', description: 'Install stainless, composite sink', firstFloor: '$150–$300/unit', secondFloor: '$172.50–$345/unit' },
        { type: 'kitchen-faucet', description: 'Install single-handle, touchless', firstFloor: '$100–$200/unit', secondFloor: '$115–$230/unit' },
        { type: 'kitchen-lighting', description: 'Install pendant, recessed', firstFloor: '$100–$250/unit', secondFloor: '$115–$287.50/unit' },
        { type: 'kitchen-appliance', description: 'Install oven, refrigerator', firstFloor: '$150–$400/unit', secondFloor: '$172.50–$460/unit' },
      ],
    },
    bathroom: {
      icon: 'fa-bath',
      surfaceBased: [
        { type: 'bathroom-flooring', description: 'Install tile, vinyl', firstFloor: '$5–$8/sqft', secondFloor: '$5.75–$9.20/sqft' },
        { type: 'bathroom-shower-tiles', description: 'Install mosaic, porcelain', firstFloor: '$10–$25/sqft', secondFloor: '$11.50–$28.75/sqft' },
        { type: 'bathroom-walls', description: 'Install paint, tile', firstFloor: '$2–$10/sqft', secondFloor: '$2.30–$11.50/sqft' },
      ],
      linearFtBased: [
        { type: 'bathroom-vanity', description: 'Install single or double vanity', firstFloor: '$50–$100/linear ft', secondFloor: '$57.50–$115/linear ft' },
        { type: 'bathroom-trim', description: 'Install decorative molding', firstFloor: '$5–$10/linear ft', secondFloor: '$5.75–$11.50/linear ft' },
      ],
      unitBased: [
        { type: 'bathroom-vanity-24-inch', description: 'Install 24-inch vanity', firstFloor: '$200/unit', secondFloor: '$230/unit' },
        { type: 'bathroom-vanity-36-inch', description: 'Install 36-inch vanity', firstFloor: '$300/unit', secondFloor: '$345/unit' },
        { type: 'bathroom-vanity-48-inch', description: 'Install 48-inch vanity', firstFloor: '$400/unit', secondFloor: '$460/unit' },
        { type: 'bathroom-faucet', description: 'Install single-hole, widespread', firstFloor: '$100–$200/unit', secondFloor: '$115–$230/unit' },
        { type: 'bathroom-toilet', description: 'Install standard, smart toilet', firstFloor: '$150–$350/unit', secondFloor: '$172.50–$402.50/unit' },
        { type: 'bathroom-lighting', description: 'Install vanity, sconce', firstFloor: '$100–$250/unit', secondFloor: '$115–$287.50/unit' },
        { type: 'bathroom-bathtub', description: 'Install alcove, freestanding', firstFloor: '$300–$800/unit', secondFloor: '$345–$920/unit' },
      ],
    },
    livingRoom: {
      icon: 'fa-couch',
      surfaceBased: [
        { type: 'living-room-flooring', description: 'Install hardwood, carpet', firstFloor: '$4–$7/sqft', secondFloor: '$4.60–$8.05/sqft' },
        { type: 'living-room-walls', description: 'Install paint, wallpaper', firstFloor: '$2–$5/sqft', secondFloor: '$2.30–$5.75/sqft' },
      ],
      linearFtBased: [
        { type: 'living-room-trim', description: 'Install standard molding', firstFloor: '$5–$10/linear ft', secondFloor: '$5.75–$11.50/linear ft' },
        { type: 'living-room-crown-molding', description: 'Install ornate molding', firstFloor: '$8–$15/linear ft', secondFloor: '$9.20–$17.25/linear ft' },
      ],
      unitBased: [
        { type: 'living-room-lighting', description: 'Install chandelier, recessed', firstFloor: '$100–$250/unit', secondFloor: '$115–$287.50/unit' },
        { type: 'living-room-ceiling-fan', description: 'Install standard, smart', firstFloor: '$100–$200/unit', secondFloor: '$115–$230/unit' },
      ],
    },
    bedroom: {
      icon: 'fa-bed',
      surfaceBased: [
        { type: 'bedroom-flooring', description: 'Install carpet, hardwood', firstFloor: '$4–$7/sqft', secondFloor: '$4.60–$8.05/sqft' },
        { type: 'bedroom-walls', description: 'Install paint, wallpaper', firstFloor: '$2–$5/sqft', secondFloor: '$2.30–$5.75/sqft' },
      ],
      linearFtBased: [
        { type: 'bedroom-trim', description: 'Install standard molding', firstFloor: '$5–$10/linear ft', secondFloor: '$5.75–$11.50/linear ft' },
        { type: 'bedroom-closet-shelves', description: 'Install wire, wood shelves', firstFloor: '$10–$20/linear ft', secondFloor: '$11.50–$23/linear ft' },
      ],
      unitBased: [
        { type: 'bedroom-lighting', description: 'Install recessed, sconce', firstFloor: '$100–$250/unit', secondFloor: '$115–$287.50/unit' },
        { type: 'bedroom-ceiling-fan', description: 'Install standard, smart', firstFloor: '$100–$200/unit', secondFloor: '$115–$230/unit' },
      ],
    },
    garage: {
      icon: 'fa-warehouse',
      surfaceBased: [
        { type: 'garage-flooring', description: 'Install epoxy, tile', firstFloor: '$2–$5/sqft', secondFloor: '$2.30–$5.75/sqft' },
        { type: 'garage-walls', description: 'Install drywall, pegboard', firstFloor: '$2–$5/sqft', secondFloor: '$2.30–$5.75/sqft' },
      ],
      linearFtBased: [
        { type: 'garage-shelves', description: 'Install wire, metal shelves', firstFloor: '$10–$20/linear ft', secondFloor: '$11.50–$23/linear ft' },
      ],
      unitBased: [
        { type: 'garage-door', description: 'Install steel, insulated door', firstFloor: '$200–$500/unit', secondFloor: '$230–$575/unit' },
        { type: 'garage-lighting', description: 'Install LED, motion-sensor', firstFloor: '$100–$200/unit', secondFloor: '$115–$230/unit' },
      ],
    },
    basement: {
      icon: 'fa-home',
      surfaceBased: [
        { type: 'basement-flooring', description: 'Install carpet, vinyl', firstFloor: '$4–$7/sqft', secondFloor: '$4.60–$8.05/sqft' },
        { type: 'basement-walls', description: 'Install drywall, waterproof', firstFloor: '$2–$5/sqft', secondFloor: '$2.30–$5.75/sqft' },
      ],
      linearFtBased: [
        { type: 'basement-trim', description: 'Install standard molding', firstFloor: '$5–$10/linear ft', secondFloor: '$5.75–$11.50/linear ft' },
      ],
      unitBased: [
        { type: 'basement-lighting', description: 'Install recessed, track', firstFloor: '$100–$250/unit', secondFloor: '$115–$287.50/unit' },
        { type: 'basement-window', description: 'Install egress, slider', firstFloor: '$200–$500/unit', secondFloor: '$230–$575/unit' },
      ],
    },
    laundryRoom: {
      icon: 'fa-tshirt',
      surfaceBased: [
        { type: 'laundry-room-flooring', description: 'Install tile, vinyl', firstFloor: '$4–$7/sqft', secondFloor: '$4.60–$8.05/sqft' },
      ],
      linearFtBased: [
        { type: 'laundry-room-shelves', description: 'Install wire, wood shelves', firstFloor: '$10–$20/linear ft', secondFloor: '$11.50–$23/linear ft' },
        { type: 'laundry-room-countertop', description: 'Install laminate, quartz', firstFloor: '$20–$50/linear ft', secondFloor: '$23–$57.50/linear ft' },
      ],
      unitBased: [
        { type: 'laundry-room-sink', description: 'Install utility, stainless sink', firstFloor: '$150–$300/unit', secondFloor: '$172.50–$345/unit' },
        { type: 'laundry-room-faucet', description: 'Install single-handle', firstFloor: '$100–$200/unit', secondFloor: '$115–$230/unit' },
      ],
    },
    hallway: {
      icon: 'fa-door-open',
      surfaceBased: [
        { type: 'hallway-flooring', description: 'Install hardwood, carpet', firstFloor: '$4–$7/sqft', secondFloor: '$4.60–$8.05/sqft' },
        { type: 'hallway-walls', description: 'Install paint, wallpaper', firstFloor: '$2–$5/sqft', secondFloor: '$2.30–$5.75/sqft' },
      ],
      linearFtBased: [
        { type: 'hallway-trim', description: 'Install standard molding', firstFloor: '$5–$10/linear ft', secondFloor: '$5.75–$11.50/linear ft' },
        { type: 'hallway-handrail', description: 'Install wood, metal', firstFloor: '$10–$20/linear ft', secondFloor: '$11.50–$23/linear ft' },
      ],
      unitBased: [
        { type: 'hallway-lighting', description: 'Install sconce, recessed', firstFloor: '$100–$250/unit', secondFloor: '$115–$287.50/unit' },
      ],
    },
    diningRoom: {
      icon: 'fa-utensils',
      surfaceBased: [
        { type: 'dining-room-flooring', description: 'Install hardwood, tile', firstFloor: '$4–$7/sqft', secondFloor: '$4.60–$8.05/sqft' },
        { type: 'dining-room-walls', description: 'Install paint, wallpaper', firstFloor: '$2–$5/sqft', secondFloor: '$2.30–$5.75/sqft' },
      ],
      linearFtBased: [
        { type: 'dining-room-trim', description: 'Install standard molding', firstFloor: '$5–$10/linear ft', secondFloor: '$5.75–$11.50/linear ft' },
        { type: 'dining-room-crown-molding', description: 'Install ornate molding', firstFloor: '$8–$15/linear ft', secondFloor: '$9.20–$17.25/linear ft' },
      ],
      unitBased: [
        { type: 'dining-room-lighting', description: 'Install chandelier, pendant', firstFloor: '$100–$250/unit', secondFloor: '$115–$287.50/unit' },
      ],
    },
    exterior: {
      icon: 'fa-home',
      surfaceBased: [
        { type: 'exterior-painting', description: 'Paint siding, trim', firstFloor: '$2–$5/sqft', secondFloor: '$2.30–$5.75/sqft' },
        { type: 'exterior-siding', description: 'Install vinyl, brick', firstFloor: '$4–$8/sqft', secondFloor: '$4.60–$9.20/sqft' },
      ],
      linearFtBased: [
        { type: 'exterior-fencing', description: 'Install wood, vinyl fence', firstFloor: '$10–$20/linear ft', secondFloor: '$11.50–$23/linear ft' },
        { type: 'exterior-gutters', description: 'Install aluminum, copper', firstFloor: '$5–$10/linear ft', secondFloor: '$5.75–$11.50/linear ft' },
      ],
      unitBased: [
        { type: 'exterior-door', description: 'Install steel, fiberglass door', firstFloor: '$200–$500/unit', secondFloor: '$230–$575/unit' },
        { type: 'exterior-lighting', description: 'Install wall-mounted, solar', firstFloor: '$100–$200/unit', secondFloor: '$115–$230/unit' },
      ],
    },
    general: {
      icon: 'fa-tools',
      surfaceBased: [
        { type: 'general-painting', description: 'Interior, exterior paint', firstFloor: '$2–$5/sqft', secondFloor: '$2.30–$5.75/sqft' },
        { type: 'general-drywall', description: 'Install standard drywall', firstFloor: '$2–$5/sqft', secondFloor: '$2.30–$5.75/sqft' },
        { type: 'general-flooring', description: 'Install hardwood, carpet', firstFloor: '$4–$7/sqft', secondFloor: '$4.60–$8.05/sqft' },
      ],
      linearFtBased: [
        { type: 'general-trim', description: 'Install standard trim', firstFloor: '$5–$10/linear ft', secondFloor: '$5.75–$11.50/linear ft' },
        { type: 'general-baseboards', description: 'Install standard baseboards', firstFloor: '$5–$10/linear ft', secondFloor: '$5.75–$11.50/linear ft' },
      ],
      unitBased: [
        { type: 'general-lighting', description: 'Install recessed, pendant', firstFloor: '$100–$250/unit', secondFloor: '$115–$287.50/unit' },
        { type: 'general-doors', description: 'Install interior, sliding doors', firstFloor: '$150–$400/unit', secondFloor: '$172.50–$460/unit' },
      ],
    },
  };

  // Filter data based on search term
  const filteredData = Object.entries(laborData).reduce((acc, [category, { icon, surfaceBased, linearFtBased, unitBased }]) => {
    const filteredSurface = surfaceBased.filter(item => item.type.toLowerCase().includes(searchTerm) || item.description.toLowerCase().includes(searchTerm));
    const filteredLinear = linearFtBased.filter(item => item.type.toLowerCase().includes(searchTerm) || item.description.toLowerCase().includes(searchTerm));
    const filteredUnit = unitBased.filter(item => item.type.toLowerCase().includes(searchTerm) || item.description.toLowerCase().includes(searchTerm));
    
    if (filteredSurface.length > 0 || filteredLinear.length > 0 || filteredUnit.length > 0) {
      acc[category] = { icon, surfaceBased: filteredSurface, linearFtBased: filteredLinear, unitBased: filteredUnit };
    }
    return acc;
  }, {});

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <i className="fas fa-dollar-sign"></i> Labor Pricing Guide
        </h2>
        <p className={styles.note}>
          Labor charges for home improvement services in Illinois. Second floor rates are 15% higher due to additional effort (e.g., carrying materials upstairs). Use this guide to set fair prices for your customers.
        </p>
        <div className={styles.searchBar}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search tasks (e.g., vanity, flooring)"
            value={searchTerm}
            onChange={handleSearch}
            className={styles.searchInput}
          />
        </div>
      </div>
      {Object.entries(filteredData).map(([category, { icon, surfaceBased, linearFtBased, unitBased }]) => (
        <div key={category} className={styles.section}>
          <div className={styles.sectionHeader}>
            <button
              className={styles.toggleButton}
              onClick={() => toggleSection(category)}
              title={expandedSections.has(category) ? 'Collapse' : 'Expand'}
            >
              <i
                className={`fas ${
                  expandedSections.has(category) ? 'fa-chevron-down' : 'fa-chevron-right'
                }`}
              ></i>
            </button>
            <h3 className={styles.sectionTitle}>
              <i className={`fas ${icon}`}></i>{' '}
              {category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')}
            </h3>
          </div>
          {expandedSections.has(category) && (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Description</th>
                    <th>First Floor Cost</th>
                    <th>Second Floor Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {surfaceBased.map(({ type, description, firstFloor, secondFloor }) => (
                    <tr key={type}>
                      <td>{type.replace(/-/g, ' ').replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())}</td>
                      <td>{description}</td>
                      <td>{firstFloor}</td>
                      <td>{secondFloor}</td>
                    </tr>
                  ))}
                  {linearFtBased.map(({ type, description, firstFloor, secondFloor }) => (
                    <tr key={type}>
                      <td>{type.replace(/-/g, ' ').replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())}</td>
                      <td>{description}</td>
                      <td>{firstFloor}</td>
                      <td>{secondFloor}</td>
                    </tr>
                  ))}
                  {unitBased.map(({ type, description, firstFloor, secondFloor }) => (
                    <tr key={type}>
                      <td>{type.replace(/-/g, ' ').replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())}</td>
                      <td>{description}</td>
                      <td>{firstFloor}</td>
                      <td>{secondFloor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
      {Object.keys(filteredData).length === 0 && (
        <p className={styles.noResults}>No tasks match your search. Try a different term.</p>
      )}
    </div>
  );
}