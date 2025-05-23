//src/components/LaborPricingSheet/LaborPricingSheet.jsx
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

  // Labor pricing data (Illinois, 2025, mid-range, fair, labor only)
  const laborData = {
    kitchen: {
      icon: 'fa-utensils',
      surfaceBased: [
        { type: 'kitchen-flooring', description: 'Install hardwood, tile, vinyl', cost: '$4.50–$7.50/sqft' },
        { type: 'kitchen-backsplash', description: 'Install ceramic, glass tiles', cost: '$11–$22/sqft' },
        { type: 'kitchen-ceiling', description: 'Install drywall, paint', cost: '$2.20–$5.50/sqft' },
      ],
      linearFtBased: [
        { type: 'kitchen-cabinets', description: 'Install stock or custom cabinets', cost: '$55–$160/linear ft' },
        { type: 'kitchen-countertops', description: 'Install granite, quartz', cost: '$22–$55/linear ft' },
        { type: 'kitchen-trim', description: 'Install baseboards, molding', cost: '$5.50–$11/linear ft' },
      ],
      unitBased: [
        { type: 'kitchen-sink', description: 'Install stainless, composite sink', cost: '$160–$320/unit' },
        { type: 'kitchen-faucet', description: 'Install single-handle, touchless', cost: '$110–$220/unit' },
        { type: 'kitchen-lighting', description: 'Install pendant, recessed', cost: '$110–$270/unit' },
        { type: 'kitchen-appliance', description: 'Install oven, refrigerator', cost: '$160–$430/unit' },
      ],
    },
    bathroom: {
      icon: 'fa-bath',
      surfaceBased: [
        { type: 'bathroom-flooring', description: 'Install tile, vinyl', cost: '$5.50–$8.50/sqft' },
        { type: 'bathroom-shower-tiles', description: 'Install mosaic, porcelain', cost: '$11–$27/sqft' },
        { type: 'bathroom-walls', description: 'Install paint, tile', cost: '$2.20–$11/sqft' },
      ],
      linearFtBased: [
        { type: 'bathroom-vanity', description: 'Install single or double vanity', cost: '$55–$110/linear ft' },
        { type: 'bathroom-trim', description: 'Install decorative molding', cost: '$5.50–$11/linear ft' },
      ],
      unitBased: [
        { type: 'bathroom-vanity-24-inch', description: 'Install 24-inch vanity', cost: '$220/unit' },
        { type: 'bathroom-vanity-36-inch', description: 'Install 36-inch vanity', cost: '$330/unit' },
        { type: 'bathroom-vanity-48-inch', description: 'Install 48-inch vanity', cost: '$440/unit' },
        { type: 'bathroom-faucet', description: 'Install single-hole, widespread', cost: '$110–$220/unit' },
        { type: 'bathroom-toilet', description: 'Install standard, smart toilet', cost: '$160–$380/unit' },
        { type: 'bathroom-lighting', description: 'Install vanity, sconce', cost: '$110–$270/unit' },
        { type: 'bathroom-bathtub', description: 'Install alcove, freestanding', cost: '$330–$860/unit' },
      ],
    },
    livingRoom: {
      icon: 'fa-couch',
      surfaceBased: [
        { type: 'living-room-flooring', description: 'Install hardwood, carpet', cost: '$4.50–$7.50/sqft' },
        { type: 'living-room-walls', description: 'Install paint, wallpaper', cost: '$2.20–$5.50/sqft' },
      ],
      linearFtBased: [
        { type: 'living-room-trim', description: 'Install standard molding', cost: '$5.50–$11/linear ft' },
        { type: 'living-room-crown-molding', description: 'Install ornate molding', cost: '$8.50–$16/linear ft' },
      ],
      unitBased: [
        { type: 'living-room-lighting', description: 'Install chandelier, recessed', cost: '$110–$270/unit' },
        { type: 'living-room-ceiling-fan', description: 'Install standard, smart', cost: '$110–$220/unit' },
      ],
    },
    bedroom: {
      icon: 'fa-bed',
      surfaceBased: [
        { type: 'bedroom-flooring', description: 'Install carpet, hardwood', cost: '$4.50–$7.50/sqft' },
        { type: 'bedroom-walls', description: 'Install paint, wallpaper', cost: '$2.20–$5.50/sqft' },
      ],
      linearFtBased: [
        { type: 'bedroom-trim', description: 'Install standard molding', cost: '$5.50–$11/linear ft' },
        { type: 'bedroom-closet-shelves', description: 'Install wire, wood shelves', cost: '$11–$22/linear ft' },
      ],
      unitBased: [
        { type: 'bedroom-lighting', description: 'Install recessed, sconce', cost: '$110–$270/unit' },
        { type: 'bedroom-ceiling-fan', description: 'Install standard, smart', cost: '$110–$220/unit' },
      ],
    },
    garage: {
      icon: 'fa-warehouse',
      surfaceBased: [
        { type: 'garage-flooring', description: 'Install epoxy, tile', cost: '$2.20–$5.50/sqft' },
        { type: 'garage-walls', description: 'Install drywall, pegboard', cost: '$2.20–$5.50/sqft' },
      ],
      linearFtBased: [
        { type: 'garage-shelves', description: 'Install wire, metal shelves', cost: '$11–$22/linear ft' },
      ],
      unitBased: [
        { type: 'garage-door', description: 'Install steel, insulated door', cost: '$220–$540/unit' },
        { type: 'garage-lighting', description: 'Install LED, motion-sensor', cost: '$110–$220/unit' },
      ],
    },
    basement: {
      icon: 'fa-home',
      surfaceBased: [
        { type: 'basement-flooring', description: 'Install carpet, vinyl', cost: '$4.50–$7.50/sqft' },
        { type: 'basement-walls', description: 'Install drywall, waterproof', cost: '$2.20–$5.50/sqft' },
      ],
      linearFtBased: [
        { type: 'basement-trim', description: 'Install standard molding', cost: '$5.50–$11/linear ft' },
      ],
      unitBased: [
        { type: 'basement-lighting', description: 'Install recessed, track', cost: '$110–$270/unit' },
        { type: 'basement-window', description: 'Install egress, slider', cost: '$220–$540/unit' },
      ],
    },
    laundryRoom: {
      icon: 'fa-tshirt',
      surfaceBased: [
        { type: 'laundry-room-flooring', description: 'Install tile, vinyl', cost: '$4.50–$7.50/sqft' },
      ],
      linearFtBased: [
        { type: 'laundry-room-shelves', description: 'Install wire, wood shelves', cost: '$11–$22/linear ft' },
        { type: 'laundry-room-countertop', description: 'Install laminate, quartz', cost: '$22–$55/linear ft' },
      ],
      unitBased: [
        { type: 'laundry-room-sink', description: 'Install utility, stainless sink', cost: '$160–$320/unit' },
        { type: 'laundry-room-faucet', description: 'Install single-handle', cost: '$110–$220/unit' },
      ],
    },
    hallway: {
      icon: 'fa-door-open',
      surfaceBased: [
        { type: 'hallway-flooring', description: 'Install hardwood, carpet', cost: '$4.50–$7.50/sqft' },
        { type: 'hallway-walls', description: 'Install paint, wallpaper', cost: '$2.20–$5.50/sqft' },
      ],
      linearFtBased: [
        { type: 'hallway-trim', description: 'Install standard molding', cost: '$5.50–$11/linear ft' },
        { type: 'hallway-handrail', description: 'Install wood, metal', cost: '$11–$22/linear ft' },
      ],
      unitBased: [
        { type: 'hallway-lighting', description: 'Install sconce, recessed', cost: '$110–$270/unit' },
      ],
    },
    diningRoom: {
      icon: 'fa-utensils',
      surfaceBased: [
        { type: 'dining-room-flooring', description: 'Install hardwood, tile', cost: '$4.50–$7.50/sqft' },
        { type: 'dining-room-walls', description: 'Install paint, wallpaper', cost: '$2.20–$5.50/sqft' },
      ],
      linearFtBased: [
        { type: 'dining-room-trim', description: 'Install standard molding', cost: '$5.50–$11/linear ft' },
        { type: 'dining-room-crown-molding', description: 'Install ornate molding', cost: '$8.50–$16/linear ft' },
      ],
      unitBased: [
        { type: 'dining-room-lighting', description: 'Install chandelier, pendant', cost: '$110–$270/unit' },
      ],
    },
    exterior: {
      icon: 'fa-home',
      surfaceBased: [
        { type: 'exterior-painting', description: 'Paint siding, trim', cost: '$2.20–$5.50/sqft' },
        { type: 'exterior-siding', description: 'Install vinyl, brick', cost: '$4.50–$8.50/sqft' },
      ],
      linearFtBased: [
        { type: 'exterior-fencing', description: 'Install wood, vinyl fence', cost: '$11–$22/linear ft' },
        { type: 'exterior-gutters', description: 'Install aluminum, copper', cost: '$5.50–$11/linear ft' },
      ],
      unitBased: [
        { type: 'exterior-door', description: 'Install steel, fiberglass door', cost: '$220–$540/unit' },
        { type: 'exterior-lighting', description: 'Install wall-mounted, solar', cost: '$110–$220/unit' },
      ],
    },
    electrical: {
      icon: 'fa-bolt',
      surfaceBased: [
        { type: 'electrical-panel-upgrade', description: 'Install 100–400 amp panel', cost: '$11–$22/sqft' },
        { type: 'electrical-wiring', description: 'Install copper, aluminum wiring', cost: '$5.50–$11/sqft' },
        { type: 'electrical-ceiling-fan-installation', description: 'Install standard, smart fan', cost: '$5.50–$8.50/sqft' },
        { type: 'electrical-recessed-lighting', description: 'Install LED, halogen lights', cost: '$5.50–$11/sqft' },
      ],
      linearFtBased: [
        { type: 'electrical-conduit-installation', description: 'Install PVC, metal conduit', cost: '$5.50–$16/linear ft' },
        { type: 'electrical-cable-run', description: 'Install Cat5, Cat6, coaxial', cost: '$3.30–$8.50/linear ft' },
        { type: 'electrical-baseboard-heater', description: 'Install electric, hydronic heater', cost: '$22–$43/linear ft' },
        { type: 'electrical-under-cabinet-lighting', description: 'Install LED, xenon lighting', cost: '$11–$22/linear ft' },
      ],
      unitBased: [
        { type: 'electrical-outlet-installation', description: 'Install standard, GFCI, USB outlet', cost: '$110–$220/unit' },
        { type: 'electrical-switch-installation', description: 'Install single-pole, three-way switch', cost: '$90–$160/unit' },
        { type: 'electrical-light-fixture-installation', description: 'Install flush-mount, pendant', cost: '$110–$270/unit' },
        { type: 'electrical-smoke-detector-installation', description: 'Install battery, hardwired detector', cost: '$90–$160/unit' },
        { type: 'electrical-carbon-monoxide-detector', description: 'Install battery, hardwired detector', cost: '$90–$160/unit' },
        { type: 'electrical-circuit-breaker', description: 'Install single, double-pole breaker', cost: '$110–$220/unit' },
        { type: 'electrical-gfci-outlet', description: 'Install 15–20 amp GFCI outlet', cost: '$130–$220/unit' },
        { type: 'electrical-usb-outlet', description: 'Install dual-USB, USB-C outlet', cost: '$130–$220/unit' },
        { type: 'electrical-dimmer-switch', description: 'Install rotary, smart dimmer', cost: '$110–$190/unit' },
        { type: 'electrical-motion-sensor-switch', description: 'Install infrared, ultrasonic switch', cost: '$130–$220/unit' },
        { type: 'electrical-smart-switch', description: 'Install WiFi, Zigbee switch', cost: '$160–$270/unit' },
        { type: 'electrical-doorbell-installation', description: 'Install wired, wireless doorbell', cost: '$110–$220/unit' },
        { type: 'electrical-security-light', description: 'Install motion-sensor, dusk-to-dawn', cost: '$130–$270/unit' },
        { type: 'electrical-flood-light', description: 'Install LED, halogen flood light', cost: '$160–$320/unit' },
        { type: 'electrical-wall-sconce', description: 'Install indoor, outdoor sconce', cost: '$110–$270/unit' },
        { type: 'electrical-chandelier-installation', description: 'Install single, multi-tier chandelier', cost: '$220–$540/unit' },
        { type: 'electrical-thermostat-installation', description: 'Install programmable, smart thermostat', cost: '$110–$270/unit' },
        { type: 'electrical-ev-charger-installation', description: 'Install Level 1, Level 2 charger', cost: '$550–$1100/unit' },
        { type: 'electrical-surge-protector', description: 'Install whole-house, point-of-use', cost: '$220–$540/unit' },
        { type: 'electrical-grounding-rod', description: 'Install copper, galvanized rod', cost: '$160–$320/unit' },
        { type: 'electrical-junction-box', description: 'Install plastic, metal box', cost: '$90–$160/unit' },
        { type: 'electrical-exhaust-fan', description: 'Install bathroom, kitchen fan', cost: '$160–$320/unit' },
        { type: 'electrical-tv-mount-box', description: 'Install recessed, surface-mount box', cost: '$110–$220/unit' },
        { type: 'electrical-outdoor-outlet', description: 'Install weatherproof, GFCI outlet', cost: '$130–$270/unit' },
        { type: 'electrical-smart-plug', description: 'Install WiFi, Bluetooth plug', cost: '$90–$160/unit' },
        { type: 'electrical-dedicated-circuit', description: 'Install 20–50 amp circuit', cost: '$220–$430/unit' },
      ],
    },
    plumbing: {
      icon: 'fa-faucet',
      surfaceBased: [
        { type: 'plumbing-pipe-replacement', description: 'Replace copper, PEX, PVC pipes', cost: '$5.50–$11/sqft' },
        { type: 'plumbing-water-line-installation', description: 'Install copper, PEX water lines', cost: '$5.50–$13/sqft' },
        { type: 'plumbing-drain-line-installation', description: 'Install PVC, ABS drain lines', cost: '$5.50–$11/sqft' },
      ],
      linearFtBased: [
        { type: 'plumbing-piping-installation', description: 'Install copper, PEX, PVC piping', cost: '$5.50–$16/linear ft' },
        { type: 'plumbing-sewer-line', description: 'Install PVC, cast-iron sewer line', cost: '$11–$27/linear ft' },
        { type: 'plumbing-gas-line', description: 'Install black-iron, CSST gas line', cost: '$16–$33/linear ft' },
        { type: 'plumbing-radiant-floor-heating', description: 'Install hydronic, electric heating', cost: '$22–$43/linear ft' },
      ],
      unitBased: [
        { type: 'plumbing-faucet-installation', description: 'Install single-handle, touchless faucet', cost: '$110–$220/unit' },
        { type: 'plumbing-shower-head-installation', description: 'Install rain, handheld shower head', cost: '$90–$160/unit' },
        { type: 'plumbing-p-trap-installation', description: 'Install PVC, chrome P-trap', cost: '$55–$110/unit' },
        { type: 'plumbing-toilet-installation', description: 'Install one-piece, smart toilet', cost: '$160–$380/unit' },
        { type: 'plumbing-sink-installation', description: 'Install undermount, vessel sink', cost: '$160–$320/unit' },
        { type: 'plumbing-garbage-disposal', description: 'Install 1/2–3/4 HP disposal', cost: '$160–$320/unit' },
        { type: 'plumbing-water-heater-installation', description: 'Install tank, tankless heater', cost: '$550–$1100/unit' },
        { type: 'plumbing-bathtub-installation', description: 'Install alcove, freestanding tub', cost: '$330–$860/unit' },
        { type: 'plumbing-shower-valve', description: 'Install thermostatic, pressure valve', cost: '$160–$320/unit' },
        { type: 'plumbing-bidet-installation', description: 'Install standalone, seat bidet', cost: '$220–$540/unit' },
        { type: 'plumbing-sump-pump', description: 'Install submersible, pedestal pump', cost: '$330–$650/unit' },
        { type: 'plumbing-pressure-regulator', description: 'Install adjustable regulator', cost: '$160–$320/unit' },
        { type: 'plumbing-shut-off-valve', description: 'Install ball, gate valve', cost: '$90–$160/unit' },
        { type: 'plumbing-angle-stop-valve', description: 'Install quarter-turn valve', cost: '$90–$160/unit' },
        { type: 'plumbing-dishwasher-installation', description: 'Install built-in dishwasher', cost: '$160–$320/unit' },
        { type: 'plumbing-washing-machine-valve', description: 'Install single, dual valve', cost: '$110–$220/unit' },
        { type: 'plumbing-water-softener', description: 'Install salt-based softener', cost: '$550–$1100/unit' },
        { type: 'plumbing-backflow-preventer', description: 'Install pressure preventer', cost: '$220–$430/unit' },
        { type: 'plumbing-drain-cleanout', description: 'Install indoor, outdoor cleanout', cost: '$160–$320/unit' },
        { type: 'plumbing-expansion-tank', description: 'Install 2–5 gallon tank', cost: '$160–$320/unit' },
        { type: 'plumbing-leak-repair', description: 'Repair with compression, epoxy', cost: '$110–$270/unit' },
        { type: 'plumbing-pipe-insulation', description: 'Install foam, fiberglass insulation', cost: '$3.30–$8.50/unit' },
        { type: 'plumbing-outdoor-spigot', description: 'Install frost-free spigot', cost: '$110–$220/unit' },
        { type: 'plumbing-kitchen-sprayer', description: 'Install pull-out sprayer', cost: '$90–$160/unit' },
        { type: 'plumbing-bathroom-vent-fan', description: 'Install standard, with-light fan', cost: '$160–$320/unit' },
        { type: 'plumbing-water-filter-installation', description: 'Install under-sink, whole-house filter', cost: '$220–$540/unit' },
        { type: 'plumbing-instant-hot-water-dispenser', description: 'Install electric dispenser', cost: '$160–$320/unit' },
      ],
    },
    general: {
      icon: 'fa-tools',
      surfaceBased: [
        { type: 'general-painting', description: 'Interior, exterior paint', cost: '$2.20–$5.50/sqft' },
        { type: 'general-drywall', description: 'Install standard drywall', cost: '$2.20–$5.50/sqft' },
        { type: 'general-flooring', description: 'Install hardwood, carpet', cost: '$4.50–$7.50/sqft' },
      ],
      linearFtBased: [
        { type: 'general-trim', description: 'Install standard trim', cost: '$5.50–$11/linear ft' },
        { type: 'general-baseboards', description: 'Install standard baseboards', cost: '$5.50–$11/linear ft' },
      ],
      unitBased: [
        { type: 'general-lighting', description: 'Install recessed, pendant', cost: '$110–$270/unit' },
        { type: 'general-doors', description: 'Install interior, sliding doors', cost: '$160–$430/unit' },
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
          Labor charges for home improvement services in Illinois (2025). Prices are for labor only, excluding materials. Use this guide to set fair prices for your customers.
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
                    <th>Labor Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {surfaceBased.map(({ type, description, cost }) => (
                    <tr key={type}>
                      <td>{type.replace(/-/g, ' ').replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())}</td>
                      <td>{description}</td>
                      <td>{cost}</td>
                    </tr>
                  ))}
                  {linearFtBased.map(({ type, description, cost }) => (
                    <tr key={type}>
                      <td>{type.replace(/-/g, ' ').replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())}</td>
                      <td>{description}</td>
                      <td>{cost}</td>
                    </tr>
                  ))}
                  {unitBased.map(({ type, description, cost }) => (
                    <tr key={type}>
                      <td>{type.replace(/-/g, ' ').replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())}</td>
                      <td>{description}</td>
                      <td>{cost}</td>
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