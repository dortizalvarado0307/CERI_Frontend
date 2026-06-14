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
