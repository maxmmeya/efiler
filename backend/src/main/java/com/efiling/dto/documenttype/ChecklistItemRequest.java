package com.efiling.dto.documenttype;

import com.efiling.domain.entity.ChecklistItem;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChecklistItemRequest {

    @NotBlank(message = "Label is required")
    @Size(max = 500, message = "Label must not exceed 500 characters")
    private String label;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    private Integer displayOrder;

    @NotNull(message = "Item type is required")
    private ChecklistItem.ItemType itemType;

    private Boolean isRequired = false;

    private Boolean isActive = true;

    @Size(max = 2000, message = "Options must not exceed 2000 characters")
    private String options; // JSON array for SELECT and RADIO types
}
