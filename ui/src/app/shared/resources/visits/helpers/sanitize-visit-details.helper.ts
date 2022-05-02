import * as _ from "lodash";

export function getOrdersFromCurrentVisitEncounters(
  visit,
  type,
  bills?: any[],
  isEnsured?: boolean
) {
  if (!visit) {
    return null;
  }
  let procedures = [];
  _.each(visit?.encounters, (encounter) => {
    procedures = [
      ...procedures,
      ..._.map(
        encounter?.orders?.filter(
          (order) =>
            order?.orderType?.display?.toLowerCase() ===
            (type == "procedure" ? "procedure order" : "radiology order")
        ) || [],
        (order) => {
          const paid =
            !isEnsured && bills && bills?.length === 0
              ? false
              : isEnsured && bills && bills?.length === 0
              ? true
              : bills && bills?.length === 0
              ? true
              : (
                  bills.filter(
                    (bill) =>
                      (
                        bill?.items.filter(
                          (billItem) =>
                            billItem?.billItem?.item?.concept?.uuid ===
                            order?.concept?.uuid
                        ) || []
                      )?.length > 0
                  ) || []
                )?.length > 0
              ? false
              : true;

          const observation = encounter
            ? (encounter?.obs?.filter(
                (observation) =>
                  observation?.concept?.uuid === order?.concept?.uuid
              ) || [])[0]
            : null;
          return {
            orderNumber: order?.orderNumber,
            uuid: order?.uuid,
            dateActivated: order?.dateActivated,
            id: order?.uuid,
            concept: {
              uuid: order?.concept?.uuid,
              display: order?.concept?.display,
            },
            encounterUuid: order?.encounter?.uuid,
            orderer: {
              uuid: order?.orderer?.uuid,
              display: order?.orderer?.display,
            },
            value: observation ? observation?.value?.display : null,
            remarks: observation ? observation?.comment : null,
            obsDatetime: observation ? observation?.obsDatetime : null,
            paid,
            orderReason: order?.orderReason,
            orderType: order?.orderType.display,
            display: order?.display,
            instructions: order?.instructions,
            type: order?.type,
          };
        }
      ),
    ];
  });
  return procedures;
}

export function getDrugOrdersFromCurrentVisitEncounters(visit) {
  if (!visit) {
    return null;
  }
  let orders = [];
  _.each(visit.encounters, (encounter) => {
    orders = [
      ...orders,
      ..._.map(_.filter(encounter.orders, { type: "drugorder" }), (order) => {
        return {
          orderNumber: order.orderNumber,
          uuid: order.uuid,
          id: order.uuid,
          patientUuid: order.patient.uuid,
          concept: {
            uuid: order.concept.uuid,
            display: order.concept.display,
          },
          encounterUuid: order.encounter.uuid,
          orderer: {
            uuid: order.orderer.uuid,
            display: order.orderer.display,
          },
          orderReason: order.orderReason,
          orderReasonNonCoded: order.orderReasonNonCoded,
          orderType: order.orderType.display,
          urgency: order.urgency,
          display: order.display,
          instructions: order.instructions,
          drug: order.drug,
          dose: Number(order.dose),
          doseUnits: {
            uuid: order.doseUnits.uuid,
            display: order.doseUnits.display,
          },
          frequency: {
            uuid: order.frequency.uuid,
            display: order.frequency.display,
          },
          quantity: Number(order.quantity),
          numRefills: order.numRefills,
          dosingInstructions: order.dosingInstructions,
          duration: order.duration,
          durationUnits: order.durationUnits,
          route: {
            uuid: order.route.uuid,
            display: order.route.display,
          },
          brandName: order.brandName,
          type: order.type,
          dispenseAsWritten: order.dispenseAsWritten,
        };
      }),
    ];
  });
  return orders;
}