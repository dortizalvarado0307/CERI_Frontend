import { useState, useEffect } from 'react';
import type { CatalogItem } from '../models/CatalogItem';
import { getRegion } from '../api/regionApi';
import { getTypeInitiative } from '../api/typeInitiative';
import { getClassificationManagementArea } from '../api/clasificationManagementAreaApi';
import { getClassificationMetaPopulation } from '../api/clasificationMetaPopulationApi';
import { getPersonInCharge } from '../api/personInChargeApi';
import { getUniversities, getUniversityBodies } from '../api/universityApi';

type PersonOption = CatalogItem & { lastname?: string };

export function useCatalogs() {
  const [catalogs, setCatalogs] = useState<{
    typeInitiatives: CatalogItem[];
    managementAreas: CatalogItem[];
    metaPopulations: CatalogItem[];
    people: PersonOption[];
    universityBodies: CatalogItem[];
    regions: CatalogItem[];
    universities: CatalogItem[];
  }>({
    typeInitiatives: [],
    managementAreas: [],
    metaPopulations: [],
    people: [],
    universityBodies: [],
    regions: [],
    universities: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const loadAll = async () => {
      try {
        setLoading(true);
        const [
          typeInitiatives,
          managementAreas,
          metaPopulations,
          people,
          universityBodies,
          regions,
          universities,
        ] = await Promise.all([
          getTypeInitiative(controller.signal),
          getClassificationManagementArea(controller.signal),
          getClassificationMetaPopulation(controller.signal),
          getPersonInCharge(controller.signal),
          getUniversityBodies(controller.signal),
          getRegion(controller.signal),
          getUniversities(controller.signal),
        ]);

        if (controller.signal.aborted) return;

        setCatalogs({
          typeInitiatives,
          managementAreas,
          metaPopulations,
          people,
          universityBodies,
          regions,
          universities,
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadAll();

    return () => {
      controller.abort();
    };
  }, []);

  return { ...catalogs, loading };
}