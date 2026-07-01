export interface Project {
id: number;
name: string;
general_objective: string;


type_initiative?: {
	id: number;
	name: string;
};

person_in_charge?: {
	id: number;
	name: string;
	lastname: string;
};

university_body?: {
	id: number;
	name: string;
};

classification_management_area?: {
	id: number;
	name: string;
};

clasification_meta_population?: {
	id: number;
	name: string;
};

projects_commissions_region?: {
	id: number;
	region: {
		id: number;
		name: string;
	};
}[];

projects_commissions_university?: {
	id: number;
	university: {
		id: number;
		name: string;
	};
}[];


}

export interface ProjectForm {
	name: string;
	general_objective: string;
	id_type_initiative?: number;
	id_classification_management_area?: number;
	id_clasification_meta_population?: number;
	id_person_in_charge?: number;
	id_university_body?: number;
	id_user?: number;
	regions: number[];
	universities: number[];
}

export interface ProjectFilters {
	id_type_initiative?: number[];
	id_classification_management_area?: number[];
	id_clasification_meta_population?: number[];
	id_person_in_charge?: number[];
	id_university_body?: number[];
	id_region?: number[];
	id_university?: number[];
}
