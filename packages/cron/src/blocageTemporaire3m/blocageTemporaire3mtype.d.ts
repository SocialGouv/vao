export type BlocageTemporaire3mRow = {
    mail: string;
    id: number;
};

export type BlocageTemporaire3mUpdateResult = {
    id: number;
    status_code: string;
    temporary_blocked_at: string;
};