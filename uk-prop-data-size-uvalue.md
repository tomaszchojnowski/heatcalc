Archetype size table
---
property-data-sizing


* heat-loss models
* SAP / EN 12831 style calculations
* stock-level simulations
* LBSM-style archetyping


---

# Primary UK / London Housing Archetypes

*(Geometry-constrained, median-based)*

## Assumptions (explicit & defensible)

* **Median sizes**, not means
* **Rectangular footprints** (reasonable at archetype scale)
* **Typical storey heights** by age band
* **Exposed area = heat-loss envelope only**
  (excludes party walls)
* Roof assumed flat equivalent (plan area)
* Ground floor = full footprint

---

## Archetype Table (Core)

### Geometry & Adjacency

| ID | Archetype     | Age Band  | GIA (m²) | Storeys | Footprint (m²) | Party Walls | Exposed Walls |
| -- | ------------- | --------- | -------- | ------- | -------------- | ----------- | ------------- |
| T1 | Mid-terrace   | pre-1919  | 90       | 2       | 45             | 2           | Front + rear  |
| T2 | End-terrace   | pre-1919  | 100      | 2       | 50             | 1           | 3 sides       |
| T3 | Mid-terrace   | post-1945 | 85       | 2       | 42             | 2           | Front + rear  |
| T4 | End-terrace   | post-1945 | 95       | 2       | 47             | 1           | 3 sides       |
| S1 | Semi-detached | inter-war | 110      | 2       | 55             | 1           | 3 sides       |
| S2 | Semi-detached | post-1965 | 105      | 2       | 52             | 1           | 3 sides       |
| D1 | Detached      | inter-war | 140      | 2       | 70             | 0           | 4 sides       |
| D2 | Detached      | post-1980 | 155      | 2       | 78             | 0           | 4 sides       |
| B1 | Bungalow      | pre-1980  | 95       | 1       | 95             | 0           | 4 sides       |
| B2 | Bungalow      | post-1980 | 105      | 1       | 105            | 0           | 4 sides       |

---

## Derived Exposed Envelope Areas

*(heat loss)*

### Assumed wall height

* 2.6 m per storey (pre-1980)
* 2.4 m per storey (post-1980)

### Exposed Fabric Areas (Approx.)

| ID | Exposed Wall Area (m²) | Roof Area (m²) | Ground Floor (m²) | Total Exposed Envelope (m²) |
| -- | ---------------------- | -------------- | ----------------- | --------------------------- |
| T1 | ~95                    | 45             | 45                | ~185                        |
| T2 | ~165                   | 50             | 50                | ~265                        |
| T3 | ~85                    | 42             | 42                | ~169                        |
| T4 | ~150                   | 47             | 47                | ~244                        |
| S1 | ~185                   | 55             | 55                | ~295                        |
| S2 | ~175                   | 52             | 52                | ~279                        |
| D1 | ~260                   | 70             | 70                | ~400                        |
| D2 | ~245                   | 78             | 78                | ~401                        |
| B1 | ~185                   | 95             | 95                | ~375                        |
| B2 | ~170                   | 105            | 105               | ~380                        |

> These totals **exclude party walls** by design.

---

## Party Wall Heat-Loss Reality Check

| Archetype     | Party Walls | % Envelope Reduction vs Detached |
| ------------- | ----------- | -------------------------------- |
| Mid-terrace   | 2           | ~45–50%                          |
| End-terrace   | 1           | ~25–30%                          |
| Semi-detached | 1           | ~20–25%                          |
| Detached      | 0           | 0%                               |
| Bungalow      | 0           | 0%                               |

This is why **terraces outperform detached houses thermally**, even when older.

---

## London-Specific Notes (LBSM-Aligned)

* **T1–T4 and S1–S2 dominate London house stock**
* Detached archetypes (D1–D2) are **rare in inner London**
* Median footprints above align well with:

  * LBSM building polygons
  * EPC GIA bands
* Flats omitted here intentionally (separate archetype set)

---

## How to Use This Table (Practically)

### Heat-loss calculation

For each archetype:

```text
Q = Σ(U × A × ΔT)
```

Where:

* `A` comes directly from exposed areas above
* Party walls → U ≈ 0 (or very low)




---


U-Value Archtypes

---

Nice, this is the missing layer that turns archetypes into a **proper thermal model**.

Below I’ve **extended the existing archetype table** with **typical pre-retrofit U-values by age band**, aligned with:

* BREDEM / SAP defaults
* English Housing Survey fabric assumptions
* What actually shows up in EPC + LBSM data (not optimistic spec sheets)

These are **“as-built / lightly altered” medians**, not post-retrofit.

---

# UK / London Housing Archetypes

## With Typical U-Values by Age Band

---

## U-Value Assumptions (Very Important)

* Values represent **dominant construction**, not best case
* No cavity fill unless typical for the era
* Party walls assumed **U ≈ 0** (ignored for heat loss)
* Roofs assumed **some loft insulation unless stated**
* Floors assumed **uninsulated solid or suspended** unless post-1980

---

## 1️⃣ Archetypes with Fabric U-Values

### Legend

* **W** = external walls
* **R** = roof
* **F** = ground floor
* **Win** = windows (whole-window U-value)

---

### Terraced Houses

| ID | Archetype   | Age Band  | Wall (W/m²K)              | Roof | Floor | Windows      |
| -- | ----------- | --------- | ------------------------- | ---- | ----- | ------------ |
| T1 | Mid-terrace | pre-1919  | 2.0–2.2 (solid brick)     | 0.6  | 0.9   | 4.8 (single) |
| T2 | End-terrace | pre-1919  | 2.0–2.2                   | 0.6  | 0.9   | 4.8          |
| T3 | Mid-terrace | post-1945 | 1.4–1.6 (unfilled cavity) | 0.4  | 0.8   | 3.0          |
| T4 | End-terrace | post-1945 | 1.4–1.6                   | 0.4  | 0.8   | 3.0          |

---

### Semi-Detached Houses

| ID | Archetype     | Age Band  | Wall (W/m²K)           | Roof | Floor | Windows |
| -- | ------------- | --------- | ---------------------- | ---- | ----- | ------- |
| S1 | Semi-detached | inter-war | 1.6–1.8 (early cavity) | 0.5  | 0.9   | 4.8     |
| S2 | Semi-detached | post-1965 | 1.2–1.4 (cavity)       | 0.35 | 0.7   | 2.8     |

---

### Detached Houses

| ID | Archetype | Age Band  | Wall (W/m²K)               | Roof | Floor | Windows |
| -- | --------- | --------- | -------------------------- | ---- | ----- | ------- |
| D1 | Detached  | inter-war | 1.6–1.8                    | 0.5  | 0.9   | 4.8     |
| D2 | Detached  | post-1980 | 0.6–0.8 (insulated cavity) | 0.25 | 0.45  | 2.4     |

---

### Bungalows

| ID | Archetype | Age Band  | Wall (W/m²K) | Roof | Floor | Windows |
| -- | --------- | --------- | ------------ | ---- | ----- | ------- |
| B1 | Bungalow  | pre-1980  | 1.4–1.6      | 0.35 | 0.8   | 3.0     |
| B2 | Bungalow  | post-1980 | 0.6–0.8      | 0.25 | 0.45  | 2.4     |

---

## 2️⃣ One-Line “Model-Ready” U-Value Pick

If you need **a single value per element** (e.g. EN 12831 automation), use the **midpoint**:

### Recommended Defaults

| Age Band  | Walls | Roof | Floor | Windows |
| --------- | ----- | ---- | ----- | ------- |
| pre-1919  | 2.1   | 0.6  | 0.9   | 4.8     |
| inter-war | 1.7   | 0.5  | 0.9   | 4.8     |
| post-1945 | 1.5   | 0.4  | 0.8   | 3.0     |
| post-1965 | 1.3   | 0.35 | 0.7   | 2.8     |
| post-1980 | 0.7   | 0.25 | 0.45  | 2.4     |

These line up very closely with:

* SAP Appendix R
* BREDEM 2012 defaults
* EPC RdSAP inferred fabric

---

## 3️⃣ Why This Works Well with LBSM

LBSM provides:

* **Age band**
* **Built form**
* **Adjacency**

It does *not* directly give fabric U-values — so this mapping is exactly how LBSM-based energy models are typically parameterised.

> Geometry from LBSM + fabric from age band = robust stock model


---




