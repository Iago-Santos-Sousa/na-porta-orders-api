import { FilterOrderDto } from "../dto/filter-order.dto";

export interface OrderQueryFilters extends Omit<FilterOrderDto, "start_date" | "end_date"> {
  start_date?: Date;
  end_date?: Date;
}
