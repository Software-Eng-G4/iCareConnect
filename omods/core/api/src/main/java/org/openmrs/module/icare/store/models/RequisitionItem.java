package org.openmrs.module.icare.store.models;

// Generated Oct 7, 2020 12:48:40 PM by Hibernate Tools 5.2.10.Final

import org.openmrs.module.icare.core.Item;

import javax.persistence.*;
import java.util.HashMap;
import java.util.Map;

/**
 * StRequisitionItem generated by hbm2java
 */
@Embeddable
class RequisitionItemId implements java.io.Serializable {
	
	@ManyToOne
	@JoinColumn(name = "requisition_id", nullable = false)
	private Requisition requisition;
	
	@ManyToOne
	@JoinColumn(name = "item_id", nullable = false)
	private Item item;
	
	public void setRequisition(Requisition requisition) {
		this.requisition = requisition;
	}
	
	public void setItem(Item item) {
		this.item = item;
	}
	
	public Requisition getRequisition() {
		return requisition;
	}
	
	public Item getItem() {
		return item;
	}
}

@Entity
@Table(name = "st_requisition_item")
public class RequisitionItem implements java.io.Serializable {
	
	@EmbeddedId
	private RequisitionItemId id;
	
	@Column(name = "quantity")
	private Integer quantity;
	
	public Integer getQuantity() {
		return this.quantity;
	}
	
	public void setQuantity(Integer quantity) {
		this.quantity = quantity;
	}
	
	public RequisitionItemId getId() {
		return id;
	}
	
	public void setId(RequisitionItemId id) {
		this.id = id;
	}
	
	public void setRequisition(Requisition requisition) {
		if (id == null) {
			this.id = new RequisitionItemId();
		}
		this.id.setRequisition(requisition);
	}
	
	public void setItem(Item item) {
		if (id == null) {
			this.id = new RequisitionItemId();
		}
		this.id.setItem(item);
	}
	
	public Map<String, Object> toMap() {
		Map<String, Object> requisitionItemObject = new HashMap<String, Object>();
		
		requisitionItemObject.put("quantity", this.getQuantity());
		
		Map<String, Object> itemObject = new HashMap<String, Object>();
		itemObject.put("uuid", this.getId().getItem().getUuid());
		if (this.getId().getItem().getConcept() != null) {
			itemObject.put("display", this.getId().getItem().getConcept().getDisplayString());
		} else if (this.getId().getItem().getDrug() != null) {
			itemObject.put("display", this.getId().getItem().getDrug().getDisplayName());
		}
		requisitionItemObject.put("item", itemObject);
		
		Map<String, Object> requisitionObject = new HashMap<String, Object>();
		requisitionObject.put("uuid", this.getId().getRequisition().getUuid());
		
		requisitionItemObject.put("requisition", requisitionObject);
		
		return requisitionItemObject;
	}
	
}
